import { Includeable, Op, literal } from "sequelize";
import AppError from "../../errors/AppError";
import Category from "../../models/Category";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";

const ShowTicketService = async (
  id: string | number,
  withLastMessages: boolean = false
): Promise<Ticket> => {
  const findTicketInclude: Includeable[] = [
    {
      model: Contact,
      as: "contact",
      attributes: [
        "id",
        "name",
        "number",
        "domain",
        "profilePicUrl",
        "isGroup"
      ],
      include: ["extraInfo"]
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
      model: User,
      as: "participantUsers",
      required: false
    },

    {
      model: Message,
      as: "firstClientMessageAfterLastUserMessage",
      attributes: ["id", "body", "timestamp"],
      order: [["timestamp", "ASC"]],
      required: false,
      limit: 1,
      where: {
        isPrivate: {
          [Op.or]: [false, null]
        },
        fromMe: false,
        timestamp: {
          [Op.gt]: literal(
            `(SELECT MAX(mes.timestamp) FROM Messages mes WHERE mes.ticketId = Message.ticketId AND mes.fromMe = 1 AND (mes.isPrivate = 0 OR mes.isPrivate IS NULL))`
          )
        }
      }
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
    }
  ];

  if (withLastMessages) {
    findTicketInclude.push({
      model: Message,
      as: "messages",
      order: [["timestamp", "DESC"]],
      required: false,
      limit: 25,
      separate: true,
      include: [
        {
          model: Contact,
          as: "contact",
          required: false
        }
      ],
      where: {
        isPrivate: {
          [Op.or]: [false, null]
        }
      }
    });
  }

  const ticket = await Ticket.findByPk(id, {
    include: findTicketInclude
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  ticket.messages?.sort((a, b) => a.timestamp - b.timestamp);

  return ticket;
};

export default ShowTicketService;
