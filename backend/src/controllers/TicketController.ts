/*eslint-disable*/
import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateTicketService from "../services/TicketServices/CreateTicketService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import ListTicketsService from "../services/TicketServices/ListTicketsService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import formatBody from "../helpers/Mustache";
import HistoricService from "../services/TicketServices/HistoricService";
import ResolveService from "../services/TicketServices/ResolveService";
import ChangeQueueOrResolveTicketService from "../services/TicketServices/ChangeQueueOrResolveTicket";
import { IsTicketInBotService, IsTicketInBotPostService} from "../services/TicketServices/IsTicketInBotService";
import AverageService from "../services/TicketServices/AverageService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
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
  categoryId: number;
  createdAt: Date;
  finalizedAt: Date;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    searchParam,
    showAll,
    queueIds: queueIdsStringified,
    withUnreadMessages
  } = req.query as IndexQuery;

  const userId = req.user.id;
  const { companyId } = req.user;

  let queueIds: number[] = [];

  if (queueIdsStringified) {
    queueIds = JSON.parse(queueIdsStringified);
  }

  const { tickets, count, hasMore } = await ListTicketsService({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    userId,
    queueIds,
    withUnreadMessages,
    companyId
  });

  return res.status(200).json({ tickets, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, status, userId }: TicketData = req.body;
  const { companyId } = req.user;

  const ticket = await CreateTicketService({
    contactId,
    status,
    userId,
    companyId
  });

  const io = getIO();
  io.to(ticket.status).emit(`ticket${companyId}`, {
    action: "update",
    ticket
  });

  return res.status(200).json(ticket);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;

  const contact = await ShowTicketService(ticketId, companyId);

  return res.status(200).json(contact);
};

export const historic = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  const contact = await HistoricService(contactId, companyId);

  return res.status(200).json(contact);
};

export const resolve = async (req: Request, res: Response): Promise<Response> => {
  const { categoryId } = req.params;

  const category = await ResolveService(categoryId);

  return res.status(200).json(category);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const ticketData: TicketData = req.body;
  const { companyId } = req.user;

  const { ticket } = await UpdateTicketService({
    ticketData,
    ticketId,
    companyId
  });

  if (ticket.status === "closed") {
    const whatsapp = await ShowWhatsAppService(ticket.whatsappId, companyId);

    const { farewellMessage } = whatsapp;

    if (farewellMessage) {
      /*await SendWhatsAppMessage({
        body: formatBody(farewellMessage, ticket.contact),
        ticket,
        companyId,
        fromMe: true,
        bot: false
      });*/
    }
  }

  return res.status(200).json(ticket);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;

  const ticket = await DeleteTicketService(ticketId);

  const io = getIO();
  io.to(ticket.status)
    .to(ticketId)
    .to("notification")
    .emit(`ticket${ticket.companyId}`, {
      action: "delete",
      ticketId: +ticketId
    });

  return res.status(200).json({ message: "ticket deleted" });
};

export const changeQueueOrResolve = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId, queueName } = req.body;

  const ticket = await ChangeQueueOrResolveTicketService({
    messageId,
    queueName
  });

  const io = getIO();
  io.to(ticket.status)
    .to("notification")
    .to(ticket.id.toString())
    .emit(`ticket${ticket.companyId}`, {
      action: "update",
      ticket
    });

  return res.status(200).json({ message: "Ticket atualizado com sucesso!" });
};

export const isInBot = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const isTicketInBot = await IsTicketInBotService(messageId);

  return res.status(200).json(isTicketInBot);
};

export const isInBotPost = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { session, contactNumber } = req.body;

  const isTicketInBot = await IsTicketInBotPostService(session, contactNumber);

  return res.status(200).json(isTicketInBot);
};

export const average = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { averageTimes, totalAverageTime } = await AverageService(
    searchParam,
    companyId,
  );

  return res.status(200).json({ averageTimes, totalAverageTime });
};
