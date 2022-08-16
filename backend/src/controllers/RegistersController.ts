import { Request, Response } from "express";
import ListRegistersService from "../services/RegistersService/ListRegistersService";

type IndexQuery = {
  type: string,
  fileId: string,
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { type, fileId } = req.query as unknown as IndexQuery;

  const report = await ListRegistersService({ type, fileId });

  return res.status(200).json(report);
}
