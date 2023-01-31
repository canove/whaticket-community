import { Request, Response } from "express";

import Message from "../database/models/Message";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import AppError from "../errors/AppError";

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
  const { companyId } = req.user;

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId,
    companyId
  });

  SetTicketMessagesAsRead(ticket);

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];
  const { companyId } = req.user;

  const ticket = await ShowTicketService(ticketId, companyId);

  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppMedia({ media, ticket, companyId, body });
      })
    );
  } else {
    await SendWhatsAppMessage({ body, ticket, companyId, fromMe: true, bot: false, whatsMsgId: null });
  }

  SetTicketMessagesAsRead(ticket);

  return res.send();
};

export const getMessages = async (req: Request, res: Response): Promise<Response> => {
  const { msgWhatsId } = req.query;
  const { companyId } = req.user;

  const message = await Message.findOne({
    where: { id: msgWhatsId },
    attributes: ["ticketId"]
  });

  if (!message) {
    throw new AppError("ERR_NO_MESSAGE_FOUND", 404);
  }

  const ticket = await ShowTicketService(message.ticketId, companyId);

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const messages = await Message.findAll({
    where: { ticketId: message.ticketId },
    include: [
      "contact",
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  return res.json({ messages: messages.reverse() });
};
