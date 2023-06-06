import AppError from "../../errors/AppError";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import User from "../../database/models/User";
import { Op } from "sequelize";
import Queue from "../../database/models/Queue";
import TicketChanges from "../../database/models/TicketChanges";

interface Request {
  ticketId: string;
  pageNumber?: string;
  companyId: number | string;
}

interface Response {
  messages: Message[];
  ticket: Ticket;
  count: number;
  hasMore: boolean;
}

const ListMessagesService = async ({
  pageNumber = "1",
  ticketId,
  companyId
}: Request): Promise<Response> => {
  const ticket = await ShowTicketService(ticketId, companyId);

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const tickets = await Ticket.findAll({
    where: { 
      id: { [Op.lte]: ticket.id },
      contactId: ticket.contactId,
      companyId,
    },
    attributes: ["id"],
  });

  const ticketIds = tickets.map(ticket => ticket.id);

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: messages } = await Message.findAndCountAll({
    where: { ticketId: ticketIds },
    limit,
    include: [
      "contact",
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"],
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "nickname"],
        required: false,
      },
      {
        model: Ticket,
        as: "ticket",
        attributes: ["id"],
        include: [
          {
            model: TicketChanges,
            as: "ticketChanges",
            attributes: ["id", "change", "observation", "createdAt"],
            include: [
              {
                model: User,
                as: "oldUser",
                attributes: ["id", "name"],
                required: false,
              },
              {
                model: User,
                as: "newUser",
                attributes: ["id", "name"],
                required: false,
              },
              {
                model: Queue,
                as: "oldQueue",
                attributes: ["id", "name"],
                required: false,
              },
              {
                model: Queue,
                as: "newQueue",
                attributes: ["id", "name"],
                required: false,
              },
            ],
            required: false,
          }
        ],
        required: false,
      }
    ],
    offset,
    order: [["createdAt", "DESC"]]
  });

  const hasMore = count > offset + messages.length;

  return {
    messages: messages.reverse(),
    ticket,
    count,
    hasMore,
  };
};

export default ListMessagesService;
