import Ticket from "../../database/models/Ticket";
import AppError from "../../errors/AppError";
import Contact from "../../database/models/Contact";
import User from "../../database/models/User";
import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";
import { Op } from "sequelize";
import BlockedContacts from "../../database/models/BlockedContacts";
import Tasks from "../../database/models/Tasks";

const ShowTicketService = async (
  id: string | number,
  companyId: string | number,
  queuesIds: Queue[] = null
): Promise<Ticket> => {
  let whereCondition = null;

  whereCondition = { id, companyId };

  if (queuesIds) {
    whereCondition = {
      ...whereCondition,
      queueId: { [Op.or]: [queuesIds, null] },
    }
  }

  const ticket = await Ticket.findOne({
    where: whereCondition,
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"],
        include: [
          "extraInfo",
          {
            model: BlockedContacts,
            as: "blockedContacts",
            attributes: ["id", "session"],
            required: false,
          }
        ]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["name", "status", "deleted", "official"], 
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"],
        where: { deletedAt: null },
        required: false,
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      },
      {
        model: Tasks,
        as: "task",
        attributes: ["id", "description", "dueDate", "userId", "finalizedAt"],
        required: false,
      },
    ]
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  return ticket;
};

export default ShowTicketService;
