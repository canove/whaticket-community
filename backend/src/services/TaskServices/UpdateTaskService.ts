import Tasks from "../../database/models/Tasks";
import Ticket from "../../database/models/Ticket";
import AppError from "../../errors/AppError";
import ShowTicketService from "../TicketServices/ShowTicketService";
import ShowTaskService from "./ShowTaskService";

interface TaskData {
  description: string;
  dueDate: Date;
  ticketId: number;
}

interface Request {
  taskId: string;
  taskData: TaskData;
  companyId: number;
  userId: number | string;
}

interface Response {
  ticket: Ticket;
  task: Tasks;
}

const UpdateTaskService = async ({
  taskId,
  taskData,
  companyId,
  userId,
}: Request): Promise<Response> => {
  const { description, dueDate, ticketId } = taskData;

  if (!dueDate) throw new AppError("ERR_DUE_DATE_REQUIRED");

  const now = new Date();
  const due = new Date(dueDate);

  if (now.getTime() > due.getTime()) throw new AppError("ERR_INVALID_DUE_DATE");

  if ((due.getTime() - now.getTime()) >= 604800000) {
      throw new AppError("ERR_INVALID_DUE_DATE");
  }

  const ticket = await ShowTicketService(ticketId, companyId);

  const task = await ShowTaskService(taskId, companyId);

  await task.update({
    description,
    dueDate,
    userId,
  });

  await ticket.reload();

  return { task, ticket };
};

export default UpdateTaskService;
