import { Request, Response } from "express";
import ConnectionFiles from "../database/models/ConnectionFile";
import FileRegister from "../database/models/FileRegister";
import Whatsapp from "../database/models/Whatsapp";
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

export const getInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { msgWhatsId } = req.query;

  const fileRegister = await FileRegister.findOne({
    where: { msgWhatsId }
  });

  if (!fileRegister) {
    throw new AppError("ERR_FILE_REGISTER_DO_NOT_EXISTS");
  }

  let portfolio = null;

  const whatsapp = await Whatsapp.findOne({
    where: { id: fileRegister.whatsappId }
  });

  if (whatsapp && whatsapp.connectionFileId) {
    const connectionFile = await ConnectionFiles.findOne({
      where: { id: whatsapp.connectionFileId }
    });

    portfolio = connectionFile.name;
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
    var5: fileRegister.var5,
    portfolio
  };

  return res.status(200).json(response);
};
