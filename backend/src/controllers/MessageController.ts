import { Request, Response } from "express";

import { Message as WbotMessage } from "whatsapp-web.js";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";

import CreateMessageService from "../services/MessageServices/CreateMessageService";
import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    searchParam,
    pageNumber,
    ticketId
  });

  await SetTicketMessagesAsRead(ticket);

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, fromMe, read }: MessageData = req.body;
  const media = req.file;

  const ticket = await ShowTicketService(ticketId);

  let sentMessage: WbotMessage;

  if (media) {
    sentMessage = await SendWhatsAppMedia({ media, ticket });
  } else {
    sentMessage = await SendWhatsAppMessage({ body, ticket });
  }

  const newMessage = {
    id: sentMessage.id.id,
    body,
    fromMe,
    read,
    mediaType: sentMessage.type,
    mediaUrl: media?.filename
  };

  const message = await CreateMessageService({
    messageData: newMessage,
    ticketId: ticket.id
  });

  const io = getIO();
  io.to(ticketId).to("notification").emit("appMessage", {
    action: "create",
    message,
    ticket,
    contact: ticket.contact
  });

  await SetTicketMessagesAsRead(ticket);

  return res.status(200).json(message);
};
