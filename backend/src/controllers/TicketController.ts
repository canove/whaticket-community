import { Request, Response } from "express";
import { getIO } from "../libs/socket.js";

import CreateTicketService from "../services/TicketServices/CreateTicketService.js";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService.js";
import ListTicketsService from "../services/TicketServices/ListTicketsService.js";
import ShowTicketService from "../services/TicketServices/ShowTicketService.js";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService.js";
import CountTicketsByUserService from "../services/TicketServices/CountTicketsByUserService.js";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage.js";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService.js";
import formatBody from "../helpers/Mustache.js";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  cursor?: string;
  status: string;
  date: string;
  showAll: string;
  withUnreadMessages: string;
  queueIds: string;
};

interface TicketData {
  contactId: number;
  status: string;
  queueId: number;
  userId: number;
  notes: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    cursor,
    status,
    date,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    withUnreadMessages
  } = req.query as IndexQuery;

  const userId = req.user.id;
  const userProfile = req.user.profile;

  let queueIds: number[] = [];

  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified);
  }

  const { tickets, count, hasMore } = await ListTicketsService({
    searchParam,
    pageNumber,
    cursor,
    status,
    date,
    showAll,
    userId,
    userProfile,
    queueIds,
    withUnreadMessages
  });

  return res.status(200).json({ tickets, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, status, userId, queueId }: TicketData = req.body;

  const ticket = await CreateTicketService({
    contactId,
    status,
    userId,
    queueId
  });

  const io = getIO();
  io.to(ticket.status).emit("ticket", {
    action: "update",
    ticket
  });

  return res.status(200).json(ticket);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;

  const contact = await ShowTicketService(ticketId);

  return res.status(200).json(contact);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const ticketData: TicketData = req.body;

  const { ticket } = await UpdateTicketService({
    ticketData,
    ticketId
  });

  if (ticket.status === "closed") {
    const whatsapp = await ShowWhatsAppService(ticket.whatsappId);

    const { farewellMessage } = whatsapp;

    if (farewellMessage) {
      await SendWhatsAppMessage({
        body: formatBody(farewellMessage, ticket.contact),
        ticket
      });
    }
  }

  return res.status(200).json(ticket);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;

  const ticket = await DeleteTicketService(ticketId);

  const io = getIO();
  io.to(ticket.status).to(ticketId).to("notification").emit("ticket", {
    action: "delete",
    ticketId: +ticketId
  });

  return res.status(200).json({ message: "ticket deleted" });
};

export const countByUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = await CountTicketsByUserService();
  return res.status(200).json(data);
};
