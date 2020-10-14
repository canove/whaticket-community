import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";

const DeleteTicketService = async (id: string): Promise<Ticket> => {
  const ticket = await Ticket.findOne({
    where: { id }
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  await ticket.destroy();

  return ticket;
};

export default DeleteTicketService;
