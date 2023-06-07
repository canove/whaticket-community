import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateQueueService from "../services/QueueService/CreateQueueService";
import DeleteQueueService from "../services/QueueService/DeleteQueueService";
import ListQueuesService from "../services/QueueService/ListQueuesService";
import ShowQueueService from "../services/QueueService/ShowQueueService";
import UpdateQueueService from "../services/QueueService/UpdateQueueService";

type IndexQuery = {
  companyId: string,
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId: selectedCompany } = req.query as IndexQuery;
  const { companyId } = req.user;

  const queues = await ListQueuesService({ companyId, selectedCompany });

  return res.status(200).json(queues);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, color, greetingMessage, limit, overflowQueueId } = req.body;
  const { companyId } = req.user;

  const queue = await CreateQueueService({
    name,
    color,
    greetingMessage,
    companyId,
    limit,
    overflowQueueId
  });

  const io = getIO();
  io.emit(`queue${companyId}`, {
    action: "update",
    queue
  });

  return res.status(200).json(queue);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId } = req.user;

  const queue = await ShowQueueService(queueId, companyId);

  return res.status(200).json(queue);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const queueData = req.body;
  const { queueId } = req.params;
  const { companyId } = req.user;

  const queue = await UpdateQueueService(queueId, queueData, companyId);

  const io = getIO();
  io.emit(`queue${companyId}`, {
    action: "update",
    queue
  });

  return res.status(201).json(queue);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId } = req.user;

  await DeleteQueueService(queueId, companyId);

  const io = getIO();
  io.emit(`queue${companyId}`, {
    action: "delete",
    queueId: +queueId
  });

  return res.status(200).send();
};
