import { Request, Response } from "express";

import ListOperationsService from "../services/OperationsServices/ListOperationsService";

import AppError from "../errors/AppError";

type IndexQuery = {
    initialDate: string;
    finalDate: string;
    companyIds: string[];
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;
  const { initialDate, finalDate, companyIds } = req.query as IndexQuery;

  if (user.profile !== 1 || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const operations = await ListOperationsService({ initialDate, finalDate, companyIds });

  return res.status(200).json(operations);
};
