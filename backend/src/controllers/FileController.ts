import { Request, Response } from "express";
import FileService from "../services/FileService/ListFileService";

type IndexQuery = {

    Status: Number;
    initialDate: string;

};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { Status, initialDate } = req.query as unknown as IndexQuery;

    console.log(req.query)

  const report = await FileService({
    Status,
    initialDate,

  });

  console.log(report)

  return res.status(200).json(report);
};