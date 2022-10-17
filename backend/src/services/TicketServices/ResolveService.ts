import Ticket from "../../database/models/Ticket";
import AppError from "../../errors/AppError";
import Category from "../../database/models/Category";
interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  companyId: number;
}

const ResolveService = async (
  CategoryId: string | number,

): Promise<Ticket[]> => {
  const tickets = await Ticket.findAll({
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name", "description"]
      }
    ],
    where: {
      categoryId: CategoryId,
      status: "closed",

    }
  });

  if (!tickets) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  return tickets;
};

export default ResolveService;