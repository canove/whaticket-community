import { Request, Response } from "express";

import Message from "../database/models/Message";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

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

  if (ticket.status === "open") {
    SetTicketMessagesAsRead(ticket);
  }

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];
  const { companyId, id } = req.user;

  const ticket = await ShowTicketService(ticketId, companyId);

  if (ticket.userId != null && ticket.userId != id) throw new AppError("ERR_TICKET_ACCEPTED_BY_OTHER_USER");

  // if (medias) {
  //   await Promise.all(
  //     medias.map(async (media: Express.Multer.File) => {
  //       await SendWhatsAppMedia({ media, ticket, companyId, body });
  //     })
  //   );
  // } else {
  //   await SendWhatsAppMessage({ body, ticket, companyId, fromMe: true, bot: false, whatsMsgId: null });
  // }

  // SetTicketMessagesAsRead(ticket);

  await ticket.update({ 
    lastMessageFromMe: !ticket.lastMessageFromMe 
  });

  const io = getIO();

  if (ticket.lastMessageFromMe === true) {
    io.emit(`ticket${ticket.companyId}`, {
      action: "deleteLastMessage",
      ticketId: ticket.id
    });
  }

  io.to(ticket.status)
    .to("notification")
    .to(ticketId.toString())
    .emit(`ticket${ticket.companyId}`, {
      action: "update",
      ticket
    });

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

  await ShowTicketService(message.ticketId, companyId);

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

export const resend = async (req: Request, res: Response): Promise<Response> => {
  const { message } = req.body;
  const { companyId } = req.user;

  const ticket = await ShowTicketService(message.ticketId, companyId);

  await SendWhatsAppMessage({ 
    body: message.body, 
    mediaUrl: message.mediaUrl ? message.mediaUrl : null, 
    type: message.type,
    ticket, 
    companyId, 
    fromMe: true, 
    bot: false, 
    whatsMsgId: null 
  });

  SetTicketMessagesAsRead(ticket);

  return res.status(200).json("OK");
};
