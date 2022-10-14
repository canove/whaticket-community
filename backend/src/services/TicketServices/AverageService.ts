import Ticket from "../../database/models/Ticket";
import AppError from "../../errors/AppError";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  companyId: number;
}

const AverageService = async (
    CreatedAt: Date,
    FinalizedAt: Date,

): Promise<Ticket[]> => {
  const tickets = await Ticket.findAll({
    where: {
        status: "closed",
        createdAt: CreatedAt,
        finalizedAt: FinalizedAt,
    }
  });

  if (!tickets) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  return tickets;
};

export default AverageService;