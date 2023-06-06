import Tasks from "../../database/models/Tasks";
import Ticket from "../../database/models/Ticket";
import AppError from "../../errors/AppError";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface Request {
    description: string;
    dueDate: Date;
    ticketId: number;
    userId: number | string;
    companyId: number;
}

interface Response {
    task: Tasks;
    ticket: Ticket;
}

const CreateTaskService = async ({
    description, 
    dueDate, 
    ticketId, 
    userId,
    companyId,
}: Request): Promise<Response> => {
    if (!dueDate) throw new AppError("ERR_DUE_DATE_REQUIRED");

    const now = new Date();
    const due = new Date(dueDate);
  
    if (now.getTime() > due.getTime()) throw new AppError("ERR_INVALID_DUE_DATE");
  
    if ((due.getTime() - now.getTime()) >= 604800000) {
        throw new AppError("ERR_INVALID_DUE_DATE");
    }

    const ticket = await ShowTicketService(ticketId, companyId);

    const task = await Tasks.create({
        description, 
        dueDate, 
        ticketId, 
        userId,
        companyId,
    });

    await ticket.update({ taskId: task.id });

    await ticket.reload();

    return { task, ticket };
};

export default CreateTaskService;
