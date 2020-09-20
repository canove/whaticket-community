import { Op, fn, where, col } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  showAll?: string;
  userId: string;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  status,
  date,
  showAll,
  userId
}: Request): Promise<Response> => {
  let whereCondition = {};
  let includeCondition = [];

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "profilePicUrl"],
      include: ["extraInfo"]
    }
  ];

  if (showAll === "true") {
    whereCondition = {};
  } else {
    whereCondition = { userId };
  }

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  }

  if (searchParam) {
    includeCondition = [
      ...includeCondition,
      {
        model: Message,
        as: "messages",
        attributes: ["id", "body"],
        where: {
          body: where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${searchParam.toLowerCase()}%`
          )
        },
        required: false,
        duplicating: false
      }
    ];

    whereCondition = {
      [Op.or]: [
        {
          "$contact.name$": where(
            fn("LOWER", col("name")),
            "LIKE",
            `%${searchParam.toLowerCase()}%`
          )
        },
        { "$contact.number$": { [Op.like]: `%${searchParam}%` } },
        {
          "$message.body$": where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${searchParam.toLowerCase()}%`
          )
        }
      ]
    };
  }

  if (date) {
    whereCondition = {
      ...whereCondition,
      createdAt: {
        [Op.between]: [startOfDay(parseISO(date)), endOfDay(parseISO(date))]
      }
    };
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", "DESC"]]
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;
