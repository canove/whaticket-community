import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Contact from "../../models/Contact";

interface Request {
  ticketId: number;
  searchText: string;
  pageNumber: number;
}

interface Response {
  Messages: Message[];
}

const SearchMessagesService = async ({
  ticketId,
  searchText,
  pageNumber,
}: Request): Promise<Response> => {
  const pageSize = 40;
  const offset = (pageNumber - 1) * pageSize;

  const normalizedSearch = Message.normalizeText(searchText);

  const messages = await Message.findAll({
    where: {
      ticketId,
      normalizedBody: { [Op.like]: `%${normalizedSearch}%` }
    },
    include: [
      {
        model: Contact,
        attributes: ["id", "name"],
      },
    ],
    limit: pageSize,
    offset,
    order: [["createdAt", "DESC"]],
  });

  if (!messages || messages.length === 0) {
    throw new AppError("ERR_NO_MESSAGE_FOUND", 404);
  }

  return { Messages: messages };
};

export default SearchMessagesService;