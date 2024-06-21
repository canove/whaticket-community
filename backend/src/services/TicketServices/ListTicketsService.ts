import { endOfDay, parseISO, startOfDay } from "date-fns";
import {
  Filterable,
  Includeable,
  Op,
  Sequelize,
  col,
  fn,
  where
} from "sequelize";

import Category from "../../models/Category";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import ShowUserService from "../UserServices/ShowUserService";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  whatsappIds: Array<number>;
  queueIds: Array<number>;
  typeIds: Array<string>;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  whatsappIds,
  queueIds,
  typeIds,
  status,
  date,
  showAll,
  userId,
  withUnreadMessages
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"] = {
    [Op.or]: [
      { userId },
      {
        id: {
          [Op.in]: Sequelize.literal(
            `(
          SELECT \`ticketId\` FROM \`TicketHelpUsers\` WHERE \`userId\` = ${userId}
        )`
          )
        }
      },
      { status: "pending" }
    ],
    ...(typeIds?.length && {
      isGroup: {
        [Op.or]: typeIds?.map(typeId => (typeId === "group" ? true : false))
      }
    }),
    ...(queueIds?.length && {
      queueId: {
        // @ts-ignore
        [Op.or]: queueIds?.includes(null)
          ? [queueIds.filter(id => id !== null), null]
          : [queueIds]
      }
    }),
    ...(whatsappIds?.length && {
      whatsappId: {
        [Op.or]: [whatsappIds]
      }
    })
  };
  let includeCondition: Includeable[];

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "domain", "profilePicUrl"],
      ...(searchParam && { required: true })
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
    },
    {
      model: Category,
      as: "categories",
      attributes: ["id", "name", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name"]
    },
    {
      model: User,
      as: "helpUsers",
      required: false
    },
    {
      model: Message,
      as: "messages",
      separate: true, // <--- Run separate query
      limit: 1,
      order: [["timestamp", "DESC"]],
      required: false,
      where: {
        isPrivate: {
          [Op.or]: [false, null]
        }
      }
    }
  ];

  if (showAll === "true") {
    whereCondition = {
      ...(typeIds?.length && {
        isGroup: {
          [Op.or]: typeIds?.map(typeId => (typeId === "group" ? true : false))
        }
      }),
      ...(queueIds?.length && {
        queueId: {
          // @ts-ignore
          [Op.or]: queueIds?.includes(null)
            ? [queueIds.filter(id => id !== null), null]
            : [queueIds]
        }
      }),
      ...(whatsappIds?.length && {
        whatsappId: {
          [Op.or]: [whatsappIds]
        }
      })
    };
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
        { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } }
        // {
        //   "$message.body$": where(
        //     fn("LOWER", col("body")),
        //     "LIKE",
        //     `%${sanitizedSearchParam}%`
        //   )
        // }
      ]
    };
  }

  if (date) {
    whereCondition = {
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
      ...(typeIds?.length && {
        isGroup: {
          [Op.or]: typeIds?.map(typeId => (typeId === "group" ? true : false))
        }
      }),
      ...(queueIds?.length && {
        queueId: {
          // @ts-ignore
          [Op.or]: queueIds?.includes(null)
            ? [queueIds.filter(id => id !== null), null]
            : [queueIds]
        }
      }),
      ...(whatsappIds?.length && {
        whatsappId: {
          [Op.or]: [whatsappIds]
        }
      }),
      unreadMessages: { [Op.gt]: 0 }
    };
  }

  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  console.log(
    typeIds,
    "Ticket.findAndCountAll where shoGroups",
    // @ts-ignore
    whereCondition?.isGroup
  );
  // // @ts-ignore
  // console.log("Ticket.findAndCountAll where queId", whereCondition?.queueId);
  // console.log(
  //   "Ticket.findAndCountAll where whatsappId",
  //   // @ts-ignore
  //   whereCondition?.whatsappId
  // );

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["lastMessageTimestamp", "DESC"]]
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;
