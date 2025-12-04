import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface Request {
  ticketId: string;
  pageNumber?: string;
  anchorId?: string;
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
  anchorId
}: Request): Promise<Response> => {
  const ticket = await ShowTicketService(ticketId);

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const limit = 20;

  if (anchorId) {
    const anchorMessage = await Message.findByPk(anchorId);
    if (!anchorMessage) {
      throw new AppError("ERR_NO_MESSAGE_FOUND", 404);
    }

    const count = await Message.count({ where: { ticketId } });

    const messagesBefore = await Message.findAll({
      where: {
        ticketId,
        createdAt: { [Op.lt]: anchorMessage.createdAt }
      },
      limit,
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

    const messagesAfter = await Message.findAll({
      where: {
        ticketId,
        createdAt: { [Op.gte]: anchorMessage.createdAt }
      },
      limit,
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        }
      ],
      order: [["createdAt", "ASC"]]
    });

    const messages = [...messagesBefore.reverse(), ...messagesAfter];

    return {
      messages,
      ticket,
      count,
      hasMore: true // Simplification for context view
    };
  }

  const offset = limit * (+pageNumber - 1);

  const { count, rows: messages } = await Message.findAndCountAll({
    where: { ticketId },
    limit,
    include: [
      "contact",
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
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
    hasMore
  };
};

export default ListMessagesService;
