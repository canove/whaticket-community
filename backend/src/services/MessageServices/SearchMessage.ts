import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import ShowTicketService from "../TicketServices/ShowTicketService";
import { Op } from "sequelize";

interface Request {
  ticketId: string;
  searchParam?: string;
  page?: number;
}

interface Response {
  messages: Message[];
}


const searchMessage = async ({ ticketId, searchParam, page = 1 }: Request): Promise<Response> => {
  const ticket = await ShowTicketService(ticketId);

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  const limit = 40;
  const offset = (page - 1) * limit;

  const messages = await Message.findAll({
    where: {
      ticketId,
      body: {
        [Op.like]: `%${searchParam}%`
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
    limit,
    offset
  });

  if (!messages) {
    throw new AppError("Message not found", 404); 
  }

  return { messages };
};

export default searchMessage;