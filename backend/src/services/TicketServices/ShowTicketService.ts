import AppError from "../../errors/AppError";
import Category from "../../models/Category";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";

const ShowTicketService = async (id: string | number): Promise<Ticket> => {
  const ticket = await Ticket.findByPk(id, {
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "domain", "profilePicUrl"],
        include: ["extraInfo"]
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
    ]
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  return ticket;
};

export default ShowTicketService;
