import Ticket from "../../database/models/Ticket";

interface Request {
  companyId: number;
}

interface Response {
  tickets: Ticket[];
}

const ListAllTicketsService = async ({
  companyId,
}: Request): Promise<Response> => {
  const tickets = await Ticket.findAll({
    where: { companyId },
    order: [["updatedAt", "DESC"]]
  });

  return { tickets };
};

export default ListAllTicketsService;
