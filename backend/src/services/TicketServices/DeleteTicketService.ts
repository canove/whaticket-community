import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";

const DeleteTicketService = async (id: string): Promise<void> => {
  const ticket = await Ticket.findOne({
    where: { id }
  });

  if (!ticket) {
    throw new AppError("No ticket found with this ID.", 404);
  }

  await ticket.destroy();
};

export default DeleteTicketService;
