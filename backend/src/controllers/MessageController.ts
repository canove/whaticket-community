import { Request, Response } from "express";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
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
  const { body }: MessageData = req.body;
  const media = req.file;

  const ticket = await ShowTicketService(ticketId);

  if (media) {
    await SendWhatsAppMedia({ media, ticket });
  } else {
    await SendWhatsAppMessage({ body, ticket });
  }

  await SetTicketMessagesAsRead(ticket);

  return res.send();
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
