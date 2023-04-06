import Ticket from "../../database/models/Ticket";
import AppError from "../../errors/AppError";
import User from "../../database/models/User";

const HistoricService = async (
  ContactId: string | number,
  companyId: string | number
): Promise<Ticket[]> => {
  const tickets = await Ticket.findAll({
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"],
        where: { deletedAt: null },
        required: false,
      }
    ],

    where: {
      contactId: ContactId,
      companyId,
      status: "closed"
    }
  });

  if (!tickets) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  return tickets;
};

export default HistoricService;
