import { Request, Response } from "express";
import ListFileRegistersService from "../services/FileRegisterService/ListFileRegistersService";

type IndexQuery = {
  fileId: number;
  integratedImportId: number;
  pageNumber: string;
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { fileId, integratedImportId, pageNumber } =
    req.query as unknown as IndexQuery;

  const { companyId } = req.user;

  const { reports, count, hasMore } = await ListFileRegistersService({
    fileId,
    integratedImportId,
    companyId,
    pageNumber
  });

  return res.status(200).json({ reports, count, hasMore });
};
