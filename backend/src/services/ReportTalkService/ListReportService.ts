import Contact from "../../database/models/Contact";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
interface Request {
  id: number;
  body: string;
  mediaUrl: string;
  read: number | boolean;
  pageNumber?: boolean | number;
  companyId?: number;
  number?: string;
  userId?: number;
  ticketId?: number;
}
interface Response {
  messages: Message[];
  count: number;
  hasMore: boolean;
}

const ListReportService = async ({
  pageNumber,
  companyId,
  number,
  userId,
}: Request): Promise<Response> => {
  let whereCondition = null;
    if(number) {
      whereCondition = {
        number: number
      }
    }

  let whereConditionUser = null;
    if(userId) {
      whereConditionUser = {
        userId: userId
      }
    }

  whereConditionUser = {
    ...whereConditionUser,
    companyId,
  }

  let limit = 20;
  let offset = limit * (+pageNumber - 1);

  if (!pageNumber) {
    limit = null;
    offset = null
  }

  const { count, rows: messages } = await Message.findAndCountAll({
    attributes: [
      "id",
      "body",
      "mediaUrl",
      "read",
      "createdAt",
    ],

    limit,
    offset,

    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Ticket,
        as: "ticket",
        where: whereConditionUser,
        attributes: ["id", "userId"],
        required: true
      },
      {
        model: Contact,
        as: "contact",
        where: whereCondition,
        attributes: ["number"],
        required: true
      }],
  });

  const hasMore = count > offset + messages.length;

  return {messages , count, hasMore};

};

export default ListReportService;
