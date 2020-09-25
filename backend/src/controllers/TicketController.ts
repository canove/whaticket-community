import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateTicketService from "../services/TicketServices/CreateTicketService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import ListTicketsService from "../services/TicketServices/ListTicketsService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  status: string;
  date: string;
  showAll: string;
  withUnreadMessages: string;
};

interface TicketData {
  contactId: number;
  status: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    searchParam,
    showAll,
    withUnreadMessages
  } = req.query as IndexQuery;

  const userId = req.user.id;

  const { tickets, count, hasMore } = await ListTicketsService({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    userId,
    withUnreadMessages
  });

  return res.status(200).json({ tickets, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, status }: TicketData = req.body;

  const ticket = await CreateTicketService({ contactId, status });

  const io = getIO();
  io.to("notification").emit("ticket", {
    action: "create",
    ticket
  });

  return res.status(200).json(ticket);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const ticketData: TicketData = req.body;

  const ticket = await UpdateTicketService({ ticketData, ticketId });

  const io = getIO();
  io.to("notification").emit("ticket", {
    action: "updateStatus",
    ticket
  });

  return res.status(200).json(ticket);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;

  await DeleteTicketService(ticketId);

  const io = getIO();
  io.to("notification").emit("ticket", {
    action: "delete",
    ticketId: +ticketId
  });

  return res.status(200).json({ message: "ticket deleted" });
};
