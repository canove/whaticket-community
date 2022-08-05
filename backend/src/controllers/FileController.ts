import { Request, Response } from "express";
import FileService from "../services/FileService/ListFileService";

type IndexQuery = {
  Status: number;
  initialDate: string;
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { Status, initialDate } = req.query as unknown as IndexQuery;

  const report = await FileService({
    Status,
    initialDate
  });

  return res.status(200).json(report);
};