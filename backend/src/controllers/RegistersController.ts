import { Request, Response } from "express";
import RegistersService from "../services/RegistersService/RegistersService";

type IndexQuery = {
  type: string,
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { type } = req.query as unknown as IndexQuery;

  const report = await RegistersService({ type });

  return res.status(200).json(report);
}