import { Request, Response } from "express";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const reports = [];

  return res.status(200).json(reports);
};
