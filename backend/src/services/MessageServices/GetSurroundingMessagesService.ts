import Message from "../../models/Message";
import AppError from "../../errors/AppError";
import ShowTicketService from "../TicketServices/ShowTicketService";
import { Op } from "sequelize";

interface Request {
  ticketId: string;
  messageId: string;
}

interface Response {
  messages: Message[];
}

const GetSurroundingMessagesService = async ({
  ticketId,
  messageId
}: Request): Promise<Response> => {
  const ticket = await ShowTicketService(ticketId);

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  const targetMessage = await Message.findByPk(messageId);

  if (!targetMessage) {
    throw new AppError("Message not found", 404);
  }

  const messagesAbove = await Message.findAll({
    where: {
      ticketId,
      createdAt: {
        [Op.lt]: targetMessage.createdAt
      }
    },
    include: [
      "contact",
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ],
    order: [["createdAt", "DESC"]],
    limit: 10
  });

  const messagesBelow = await Message.findAll({
    where: {
      ticketId,
      createdAt: {
        [Op.gt]: targetMessage.createdAt
      }
    },
    include: [
      "contact",
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ],
    order: [["createdAt", "ASC"]],
    limit: 10
  });

  const surroundingMessages = [...messagesAbove.reverse(), targetMessage, ...messagesBelow];

  return { messages: surroundingMessages };
};

export default GetSurroundingMessagesService;
