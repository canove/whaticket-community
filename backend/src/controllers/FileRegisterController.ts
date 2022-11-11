import { Request, Response } from "express";
import FileRegister from "../database/models/FileRegister";
import AppError from "../errors/AppError";
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

export const getInfo = async (req: Request, res: Response): Promise<Response> => {
  const { msgWhatsId } = req.query;

  const fileRegister = await FileRegister.findOne({
    where: {
      msgWhatsId
    }
  });

  if (!fileRegister) {
    throw new AppError("ERR_FILE_REGISTER_DO_NOT_EXISTS");
  }

  const response = {
    name: fileRegister.name,
    documentNumber: fileRegister.documentNumber,
    message: fileRegister.message,
    phoneNumber: fileRegister.phoneNumber,
    companyId: fileRegister.companyId,
    var1: fileRegister.var1,
    var2: fileRegister.var2,
    var3: fileRegister.var3,
    var4: fileRegister.var4,
    var5: fileRegister.var5
  }

  return res.status(200).json(response);
}
