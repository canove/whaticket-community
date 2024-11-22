import { Request, Response } from "express";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import SearchMessagesService from "../services/MessageServices/SearchMessagesService";

type SearchQuery = {
  term: string;
  offset?: string;
  limit?: string;
  lastMessageId?: string;
};

type IndexQuery = {
  pageNumber: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId
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
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppMedia({ media, ticket });
      })
    );
  } else {
    await SendWhatsAppMessage({ body, ticket, quotedMsg });
  }

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

export const search = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { term, offset = "0", limit = "40", lastMessageId } = req.query as SearchQuery;

  if (!term || term.trim().length < 3) {
    return res.status(400).json({ error: "Search term must have at least 3 characters." });
  }

  try {
    const parsedOffset = parseInt(offset, 10);
    const parsedLimit = parseInt(limit, 10);
    const messages = await SearchMessagesService({
      ticketId,
      term,
      offset: Number.isNaN(parsedOffset) ? 0 : parsedOffset,
      limit: Number.isNaN(parsedLimit) ? 40 : parsedLimit,
      lastMessageId: lastMessageId ? parseInt(lastMessageId, 10) : undefined,
    });

    // Retorno da resposta
    return res.status(200).json({ 
      messages,
      hasMore: messages.length === parsedLimit,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ error: "Failed to perform search." });
  }
};

