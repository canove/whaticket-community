import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface Request {
  ticketId: string;
  pageNumber?: string;
  cursor?: string; // ISO datetime — load messages older than this (cursor-based pagination)
}

interface Response {
  messages: Message[];
  ticket: Ticket;
  count: number;
  hasMore: boolean;
}

const LIMIT = 20;

const ListMessagesService = async ({
  pageNumber = "1",
  ticketId,
  cursor
}: Request): Promise<Response> => {
  const ticket = await ShowTicketService(ticketId);

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const baseWhere: any = { ticketId };

  if (cursor) {
    // Cursor pagination: load messages older than the given timestamp — no OFFSET needed
    baseWhere.createdAt = { [Op.lt]: new Date(cursor) };
  }

  const messages = await Message.findAll({
    where: baseWhere,
    limit: LIMIT,
    include: [
      "contact",
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ],
    // Fetch newest-first so LIMIT cuts at the right end; we reverse before returning
    order: [["createdAt", "DESC"]],
    ...(cursor ? {} : { offset: LIMIT * (+pageNumber - 1) })
  });

  const hasMore = messages.length === LIMIT;

  // For the first page (no cursor) return an accurate count so the UI can show it
  const count = cursor ? 0 : await Message.count({ where: { ticketId } });

  return {
    messages: messages.reverse(),
    ticket,
    count,
    hasMore
  };
};

export default ListMessagesService;
