import AppError from "../../errors/AppError";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import User from "../../database/models/User";
import TicketHistorics from "../../database/models/TicketHistorics";
import { Op } from "sequelize";
import Queue from "../../database/models/Queue";

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
  // historic: TicketHistorics[];
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

  // const historic = await TicketHistorics.findAll({
  //   where: { 
  //     ticketId, 
  //     transferedAt: { [Op.ne]: null } 
  //   },
  //   include: [
  //     {
  //       model: Queue,
  //       as: "queue",
  //       attributes: ["id", "name"],
  //       required: false,
  //     },
  //     {
  //       model: User,
  //       as: "user",
  //       attributes: ["id", "name"],
  //       required: false,
  //     },
  //   ],
  //   order: [["createdAt", "DESC"]],
  // });

  // await setMessagesAsRead(ticket);
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: messages } = await Message.findAndCountAll({
    where: { ticketId },
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
    // historic,
  };
};

export default ListMessagesService;
