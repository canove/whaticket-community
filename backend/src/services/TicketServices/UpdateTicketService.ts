import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import User from "../../models/User";

interface TicketData {
  status?: string;
  userId?: number;
}

interface Request {
  ticketData: TicketData;
  ticketId: string;
}

interface Response {
  ticket: Ticket;
  ticketUser: User | null;
  oldStatus: string;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId
}: Request): Promise<Response> => {
  const { status, userId } = ticketData;

  const ticket = await Ticket.findOne({
    where: { id: ticketId },
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"]
      }
    ]
  });

  if (!ticket) {
    throw new AppError("No ticket found with this ID.", 404);
  }

  const oldStatus = ticket.status;

  await ticket.update({
    status,
    userId
  });
  const ticketUser = await ticket.$get("user", { attributes: ["id", "name"] });

  return { ticket, oldStatus, ticketUser };
};

export default UpdateTicketService;
