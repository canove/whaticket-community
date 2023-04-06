import { endOfDay, parseISO, startOfDay } from "date-fns";
import { Sequelize } from "sequelize-typescript";
import { Op } from "sequelize";
import Contact from "../../database/models/Contact";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import User from "../../database/models/User";
import Category from "../../database/models/Category";

interface Request {
  pageNumber?: string;
  limit?: string;
  companyId?: number;
  contactNumber?: string;
  userId?: string;
  initialDate?: string;
  finalDate?: string;
  company?: string;
  categoryId?: string;
}

interface Response {
  messages: Message[];
  count: number;
  hasMore: boolean;
}

const ListReportService = async ({
  pageNumber = "1",
  limit = "20",
  companyId,
  contactNumber,
  userId,
  initialDate,
  finalDate,
  company = null,
  categoryId
}: Request): Promise<Response> => {
  let whereConditionTicket = null;
  let whereConditionMessage = null;
  let whereConditionContact = null;

  whereConditionTicket = {
    companyId: companyId === 1 ? company ? company : companyId : companyId,
  }

  if (contactNumber) {
    whereConditionContact = {
      required: true,
      attributes: ["id", "name", "number"],
      where: { 
        number: { [Op.like]: `%${contactNumber.toLowerCase()}%` }
      }
    }
  }

  if (userId) {
    whereConditionTicket = { 
      ...whereConditionTicket,
      userId 
    }
  }

  if (categoryId) {
    whereConditionTicket = { 
      ...whereConditionTicket,
      categoryId 
    }
  }

  if (initialDate && finalDate) {
    whereConditionMessage = {
      ...whereConditionMessage,
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
      }
    }
  }

  const offset = +limit * (+pageNumber - 1);

  const { count, rows: messages } = await Message.findAndCountAll({
    where: whereConditionMessage,
    attributes: [
      "id",
      "body",
      "fromMe",
      "mediaUrl",
      "ticketId",
      "createdAt",
    ],
    include: [
      {
        model: Ticket,
        as: "ticket",
        where: whereConditionTicket,
        attributes: ["id"],
        required: true,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name"],
            where: { deletedAt: null },
            required: false,
          },
          {
            model: Contact,
            as: "contact",
            attributes: ["name", "number"],
            required: false,
            ...whereConditionContact
          },
          {
            model: Category,
            as: "category",
            attributes: ["name"],
            required: false,
          }
        ]
      },
    ],
    limit: +limit > 0 ? +limit : null,
    offset: +limit > 0 ? +offset : null,
    order: [["createdAt", "DESC"]],
  });

  const hasMore = count > offset + messages.length;

  return { messages, count, hasMore };
};

export default ListReportService;
