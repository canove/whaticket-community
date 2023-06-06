import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateTaskService from "../services/TaskServices/CreateTaskService";
import ShowTaskService from "../services/TaskServices/ShowTaskService";
import UpdateTaskService from "../services/TaskServices/UpdateTaskService";
import FinalzeTaskService from "../services/TaskServices/FinalizeTaskService";

export const store = async (req: Request, res: Response): Promise<Response> => {
    const { description, dueDate, ticketId } = req.body;
    const { companyId, id: userId } = req.user;

    const { task, ticket } = await CreateTaskService({
        description, 
        dueDate, 
        ticketId, 
        userId,
        companyId,
    });

    const io = getIO();
    io.emit(`task${companyId}`, {
        action: "update",
        task
    });

    io.to(ticket.status).emit(`ticket${companyId}`, {
      action: "update",
      ticket
    });

    return res.status(200).json(task);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
    const { taskId } = req.params;
    const { companyId } = req.user;

    const task = await ShowTaskService(taskId, companyId);

    return res.status(200).json(task);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
    const taskData = req.body;
    const { taskId } = req.params;
    const { companyId, id: userId } = req.user;

    const { ticket, task } = await UpdateTaskService({ taskId, taskData, companyId, userId });

    const io = getIO();
    io.emit(`task${companyId}`, {
        action: "update",
        task
    });

    io.to(ticket.status).emit(`ticket${companyId}`, {
        action: "update",
        ticket
    });

    return res.status(201).json(task);
};

export const finalize = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { ticketId } = req.body;
    const { taskId } = req.params;
    const { companyId } = req.user;
  
    const { task, ticket } = await FinalzeTaskService({ taskId, ticketId, companyId });
  
    const io = getIO();
    io.emit(`task${companyId}`, {
        action: "update",
        task
    });
  
    io.to(ticket.status).emit(`ticket${companyId}`, {
        action: "update",
        ticket
    });
  
    return res.status(201).json(task);
};
  