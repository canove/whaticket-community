import { Request, Response } from "express";
import ConnectionFiles from "../database/models/ConnectionFile";
import FileRegister from "../database/models/FileRegister";
import Whatsapp from "../database/models/Whatsapp";
import AppError from "../errors/AppError";
import ListFileRegistersService from "../services/FileRegisterService/ListFileRegistersService";
import GetInfo from "../services/FileRegisterService/GetInfo";

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

type GetInfoQuery = {
  msgWhatsId: string,
  registerId: string,
}

export const getInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { msgWhatsId, registerId } = req.query as GetInfoQuery;

  const response = await GetInfo({ msgWhatsId, registerId });

  return res.status(200).json(response);
};
