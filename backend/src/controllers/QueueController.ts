import { Request, Response } from "express";
import Queue from "../models/Queue";

// import { getIO } from "../libs/socket";
// import AppError from "../errors/AppError";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const queues = await Queue.findAll();

  return res.status(200).json(queues);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, color } = req.body;

  const queue = await Queue.create({ name, color });

  return res.status(200).json(queue);
};
