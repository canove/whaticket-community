import { Op, Sequelize } from "sequelize";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  messages: Message[];
  count: number;
  hasMore: boolean;
}

const SearchMessagesService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const whereCondition = {
    [Op.or]: [
      {
        body: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("Message.body")),
          "LIKE",
          `%${searchParam.toLowerCase().trim()}%`
        )
      }
    ]
  };

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: messages } = await Message.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: Contact,
        as: "contact",
        required: false
      },
      {
        model: Ticket,
        as: "ticket",
        required: true,
        include: [
          {
            model: Contact,
            as: "contact",
            required: true
          },
          {
            model: Whatsapp,
            as: "whatsapp",
            required: false
          }
        ]
      }
    ],
    limit,
    offset,
    order: [["timestamp", "DESC"]]
  });

  const hasMore = count > offset + messages.length;

  return {
    messages,
    count,
    hasMore
  };
};

export default SearchMessagesService;
