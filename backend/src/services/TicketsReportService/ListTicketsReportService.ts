import { QueryTypes } from "sequelize";
import Category from "../../database/models/Category";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";

interface Request {
  ticketId: string;
  companyId: number;
}

const ListTicketsReportService = async ({
  ticketId,
  companyId
}: Request): Promise<Ticket> => {
  const ticket = await Ticket.findOne({
    where: { id: ticketId, companyId },
    attributes: ["id"],
    include: [
      {
        model: Message,
        as: "messages",
        attributes: ["id", "body", "mediaUrl", "ticketId", "createdAt", "read"],
        required: false,
      },
      {
        model: Category,
        as: "category",
        attributes: ["name"],
        required: false,
      }
    ]
  }); 

  return ticket;
};

export default ListTicketsReportService;
