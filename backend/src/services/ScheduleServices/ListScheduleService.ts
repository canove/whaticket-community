import AppError from "../../errors/AppError";
import Schedule from "../../models/Schedule";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface Request {
  ticketId: string;
  pageNumber?: string;
}

interface Response {
  schedules: Schedule[];
  ticket: Ticket;
  count: number;
  hasMore: boolean;
}

const ListScheduleService = async ({
  pageNumber = "1",
  ticketId
}: Request): Promise<Response> => {
  const ticket = await ShowTicketService(ticketId);

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: schedules } = await Schedule.findAndCountAll({
    where: { ticketId },
    limit,
    include: [
      "contact",
      {
        model: Schedule,
        as: "quotedMsg",
        include: ["contact"]
      }
    ],
    offset,
    order: [["createdAt", "DESC"]]
  });

  const hasMore = count > offset + schedules.length;

  return {
    schedules: schedules.reverse(),
    ticket,
    count,
    hasMore
  };
};

export default ListScheduleService;
