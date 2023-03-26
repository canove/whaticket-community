import { Op, fn, where, col, Filterable, Includeable } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../database/models/Ticket";
import Contact from "../../database/models/Contact";
import Message from "../../database/models/Message";
import Queue from "../../database/models/Queue";
import ShowUserService from "../UserServices/ShowUserService";
import CheckProfilePermissionService from "../ProfileServices/CheckProfilePermissionService";
import Whatsapp from "../../database/models/Whatsapp";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  showAll?: string;
  userId: string | number;
  withUnreadMessages?: string;
  queueIds?: number[];
  companyId?: number;
  categoryId?: string;
  loggedUserId?: string | number;
  connectionFileId?: string;
  pendingAnswer?: string;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  status,
  date,
  showAll,
  userId,
  withUnreadMessages,
  connectionFileId,
  companyId,
  categoryId,
  loggedUserId,
  pendingAnswer
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"] = {
    [Op.or]: [{ userId }, { status: "pending" }],
    queueId: { [Op.or]: [queueIds, null] },
    companyId
  };
  let includeCondition: Includeable[];

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "profilePicUrl"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
  ];

  if (connectionFileId) {
    includeCondition.push({
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["id", "name", "connectionFileId"],
      where: { connectionFileId },
      required: true,
    });
  }

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  }

  if (categoryId) {
    whereCondition = {
      ...whereCondition,
      categoryId
    }
  }

  if (searchParam) {
    const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();

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
            `%${sanitizedSearchParam}%`
          )
        },
        required: false,
        duplicating: false
      }
    ];

    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          "$contact.name$": where(
            fn("LOWER", col("contact.name")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
        {
          "$message.body$": where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        }
      ]
    };
  }

  if (date) {
    whereCondition = {
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      },
      companyId
    };
  }

  if (withUnreadMessages === "true") {
    const user = await ShowUserService(userId, companyId);
    const userQueueIds = user.queues.map(queue => queue.id);

    whereCondition = {
      [Op.or]: [{ userId }, { status: "pending" }],
      queueId: { [Op.or]: [userQueueIds, null] },
      unreadMessages: { [Op.gt]: 0 },
      companyId
    };
  }

  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  const allTickets = await CheckProfilePermissionService({ userId: loggedUserId , companyId, permission: "tickets-manager:showall" });

  if (showAll === "true" && allTickets) {
    whereCondition = { ...whereCondition, companyId, queueId: { [Op.or]: [queueIds, null] } };

    if (status) whereCondition = { ...whereCondition, status };
  }

  if (!allTickets) {
    whereCondition = {
      ...whereCondition,
      userId: { [Op.or]: [loggedUserId, null]  },
      queueId: { [Op.or]: [queueIds, null] },
    }
  }

  if (pendingAnswer === "true") {
    whereCondition = {
      ...whereCondition,
      lastMessageFromMe: false
    }
  }

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
