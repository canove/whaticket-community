import { Request, Response } from "express";
import ListFileRegistersService from "../services/UploadFileService/ListFileRegistersService";

type IndexQuery = {
  fileId: number;
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { fileId } = req.query as unknown as IndexQuery;

  const report = await ListFileRegistersService({ fileId });

  return res.status(200).json(report);
}