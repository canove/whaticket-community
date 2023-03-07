import { endOfDay, parseISO, startOfDay } from "date-fns";
import { Sequelize } from "sequelize-typescript";
import { Op } from "sequelize";
import Contact from "../../database/models/Contact";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import User from "../../database/models/User";

interface Request {
  pageNumber?: string;
  limit?: string;
  companyId?: number;
  contactNumber?: string;
  userId?: string;
  initialDate?: string;
  finalDate?: string;
  company?: string;
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
  company = null
}: Request): Promise<Response> => {
  let whereConditionTicket = null;
  let whereConditionMessage = null;

  whereConditionTicket = {
    companyId: companyId === 1 ? company ? company : companyId : companyId,
  }

  if (contactNumber) {
    const contacts = await Contact.findAll({
      attributes: ["id"],
      where: { 
        "$Contact.number$": Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("Contact.number")),
          "LIKE",
          `%${contactNumber.toLowerCase()}%`
        )
      }
    });

    if (contacts.length > 0) {
      const contactsArray = contacts.map(contact => contact.id);

      whereConditionTicket = {
        ...whereConditionTicket,
        contactId: { [Op.in]: contactsArray }
      }
    }
  }

  if (userId) {
    whereConditionTicket = { 
      ...whereConditionTicket,
      userId 
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
            required: false,
          },
          {
            model: Contact,
            as: "contact",
            attributes: ["name", "number"],
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
