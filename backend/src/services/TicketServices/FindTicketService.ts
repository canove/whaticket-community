import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import User from "../../models/User";

interface WhereParams {
  id?: number;
  status?: string;
  userId?: number;
  contactId?: number;
  whatsappId?: number;
}

interface Request {
  where?: WhereParams;
}

const FindTicketService = async ({ where }: Request): Promise<Ticket> => {
  const whereCondition = { ...where };

  const ticket = await Ticket.findOne({
    where: whereCondition,
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"],
        include: ["extraInfo"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      }
    ]
  });

  if (!ticket) {
    throw new AppError("No ticket found with this conditions.", 404);
  }

  return ticket;
};

export default FindTicketService;
