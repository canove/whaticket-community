import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import UserQueue from "../models/UserQueue";
import AssociateQueueWithUserService from "../services/QueueService/AssociateQueueWithUserService";
import CreateQueueService from "../services/QueueService/CreateQueueService";
import DeleteQueueService from "../services/QueueService/DeleteQueueService";
import ListQueuesService from "../services/QueueService/ListQueuesService";
import ShowQueueService from "../services/QueueService/ShowQueueService";
import UpdateQueueService from "../services/QueueService/UpdateQueueService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const queues = await ListQueuesService();

  return res.status(200).json(queues);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, color, greetingMessage } = req.body;

  const queue = await CreateQueueService({ name, color, greetingMessage });

  const io = getIO();
  io.emit("queue", {
    action: "update",
    queue
  });

  return res.status(200).json(queue);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { queueId } = req.params;

  const queue = await ShowQueueService(queueId);

  return res.status(200).json(queue);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueId } = req.params;

  const queue = await UpdateQueueService(queueId, req.body);

  const io = getIO();
  io.emit("queue", {
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

  await DeleteQueueService(queueId);

  const io = getIO();
  io.emit("queue", {
    action: "delete",
    queueId: +queueId
  });

  return res.status(200).send();
};

export const AssociateQueueWithUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueId } = req.params;
  const { userIds } = req.body;

  const queue = await ShowQueueService(queueId);

  await AssociateQueueWithUserService(queue, userIds);

  return res.status(200).json(queue);
};

export const UpdateAssociationQueueWithUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueId } = req.params;
  const { userId, automaticallyAssign } = req.body;

  await UserQueue.update(
    { automaticallyAssign },
    { where: { userId, queueId } }
  );

  const queue = await ShowQueueService(queueId);

  await queue.reload();

  return res.status(200).json(queue);
};
