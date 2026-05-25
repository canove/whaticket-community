import { Op, fn, where, col, Filterable, Includeable } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket.js";
import Contact from "../../models/Contact.js";
import Message from "../../models/Message.js";
import Queue from "../../models/Queue.js";
import ShowUserService from "../UserServices/ShowUserService.js";
import Whatsapp from "../../models/Whatsapp.js";
import { getRedisClient } from "../../libs/redisStore.js";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  cursor?: string; // ISO updatedAt — fetch tickets updated before this timestamp
  status?: string;
  date?: string;
  showAll?: string;
  userId: string;
  userProfile?: string;
  withUnreadMessages?: string;
  queueIds: number[];
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const CACHE_TTL_SECONDS = 8;

const buildCacheKey = (
  userId: string,
  status: string | undefined,
  showAll: string | undefined,
  queueIds: number[],
  pageNumber: string,
  date: string | undefined,
  withUnreadMessages: string | undefined
): string =>
  `tickets:list:${userId}:${status}:${showAll}:${queueIds.sort().join(",")}:${pageNumber}:${date}:${withUnreadMessages}`;

export const invalidateTicketListCache = async (
  userId?: string | number
): Promise<void> => {
  const redis = getRedisClient();
  if (!redis) return;

  // Use SCAN to find and delete matching keys without blocking
  const pattern = userId ? `tickets:list:${userId}:*` : "tickets:list:*";
  let cursor = "0";
  do {
    const [next, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100
    );
    cursor = next;
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== "0");
};

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  cursor,
  queueIds,
  status,
  date,
  showAll,
  userId,
  userProfile,
  withUnreadMessages
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"] = {
    [Op.or]: [{ userId }, { status: "pending" }],
    queueId: { [Op.or]: [queueIds, null] }
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
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["name"]
    }
  ];

  if (showAll === "true" && userProfile === "admin") {
    whereCondition = { queueId: { [Op.or]: [queueIds, null] } };
  }

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
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
          // Use full-text search when available (falls back gracefully when
          // the search_vector column does not yet exist — e.g. before migration)
          [Op.or]: [
            where(
              fn(
                "to_tsvector",
                "portuguese",
                fn("coalesce", col("messages.body"), "")
              ),
              "@@",
              fn("plainto_tsquery", "portuguese", sanitizedSearchParam)
            ) as any
          ]
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
        // FTS on message body using the pre-computed search_vector index
        {
          "$messages.search_vector$": where(
            col("messages.search_vector"),
            "@@",
            fn("plainto_tsquery", "portuguese", sanitizedSearchParam)
          ) as any
        }
      ]
    };
  }

  if (date) {
    whereCondition = {
      ...whereCondition,
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      }
    };
  }

  if (withUnreadMessages === "true") {
    const user = await ShowUserService(userId);
    const userQueueIds = user.queues.map(queue => queue.id);

    whereCondition = {
      [Op.or]: [{ userId }, { status: "pending" }],
      queueId: { [Op.or]: [userQueueIds, null] },
      unreadMessages: { [Op.gt]: 0 }
    };
  }

  const limit = 40;
  const offset = cursor ? 0 : limit * (+pageNumber - 1);

  // Cursor pagination: restrict to tickets updated before the cursor timestamp
  if (cursor) {
    whereCondition = {
      ...whereCondition,
      updatedAt: { [Op.lt]: new Date(cursor) }
    };
  }

  // Only cache standard list views — search and cursor queries are too dynamic
  const isSearchQuery = !!searchParam;
  const redis = isSearchQuery || !!cursor ? null : getRedisClient();
  const cacheKey = redis
    ? buildCacheKey(
        userId,
        status,
        showAll,
        queueIds,
        pageNumber,
        date,
        withUnreadMessages
      )
    : null;

  if (redis && cacheKey) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
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
  const result = { tickets, count, hasMore };

  if (redis && cacheKey) {
    await redis
      .setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(result))
      .catch(() => {
        // Cache write failure is non-fatal
      });
  }

  return result;
};

export default ListTicketsService;
