import Ticket from "../../database/models/Ticket";
import AppError from "../../errors/AppError";
import Contact from "../../database/models/Contact";
import User from "../../database/models/User";
import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";

const ShowTicketService = async (
  id: string | number,
  companyId: string | number
): Promise<Ticket> => {
  const ticket = await Ticket.findOne({
    where: { id, companyId },
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"],
        include: ["extraInfo"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["name", "status", "deleted", "official"], 
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      }
    ]
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  return ticket;
};

export default ShowTicketService;
