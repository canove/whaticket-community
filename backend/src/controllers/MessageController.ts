import { Request, Response } from "express";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";

import CreateMessageService from "../services/MessageServices/CreateMessageService";
import ListMessagesService from "../services/MessageServices/ListMessagesService";
import SummarizeMessagesService from "../services/MessageServices/SummarizeMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

type IndexQuery = {
  pageNumber: string;
  cursor?: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber, cursor } = req.query as IndexQuery;

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId,
    cursor
  });

  SetTicketMessagesAsRead(ticket);

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  const ticket = await ShowTicketService(ticketId);

  SetTicketMessagesAsRead(ticket);

  if (medias) {
    // Sequential sends — prevents anti-spam triggers and respects rate limiting
    for (const media of medias) {
      const sentMedia = await SendWhatsAppMedia({ media, ticket });
      await CreateMessageService({
        messageData: {
          id: sentMedia.id,
          ticketId: ticket.id,
          body: sentMedia.body || media.originalname,
          fromMe: true,
          read: true,
          mediaType: sentMedia.type || "image",
          ack: sentMedia.ack || 1
        }
      });
    }
  } else {
    const sentMessage = await SendWhatsAppMessage({ body, ticket, quotedMsg });
    await CreateMessageService({
      messageData: {
        id: sentMessage.id,
        ticketId: ticket.id,
        body,
        fromMe: true,
        read: true,
        mediaType: "chat",
        quotedMsgId: quotedMsg?.id,
        ack: sentMessage.ack || 1
      }
    });
  }

  return res.send();
};

export const summary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const text = await SummarizeMessagesService(ticketId);
  return res.json({ summary: text });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const message = await DeleteWhatsAppMessage(messageId);

  const io = getIO();
  io.to(message.ticketId.toString()).emit("appMessage", {
    action: "update",
    message
  });

  return res.send();
};
