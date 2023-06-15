import Tasks from "../../database/models/Tasks";
import Ticket from "../../database/models/Ticket";
import AppError from "../../errors/AppError";
import ShowTicketService from "../TicketServices/ShowTicketService";
import ShowTaskService from "./ShowTaskService";

interface Request {
  taskId: number | string;
  companyId: number;
  ticketId: number;
}

interface Response {
  ticket: Ticket;
  task: Tasks;
}

const FinalizeTaskService = async ({
  taskId,
  ticketId,
  companyId,
}: Request): Promise<Response> => {
  const task = await ShowTaskService(taskId, companyId);
  const ticket = await ShowTicketService(ticketId, companyId);

  await task.update({ finalizedAt: new Date() });
  await ticket.update({ taskId: null });

  await task.reload();
  await ticket.reload();

  return { task, ticket };
};

export default FinalizeTaskService;
