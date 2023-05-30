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
  haveWhatsapp: string;
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { fileId, integratedImportId, pageNumber, haveWhatsapp } = req.query as unknown as IndexQuery;
  const { companyId } = req.user;

  const { reports, count, hasMore } = await ListFileRegistersService({
    fileId,
    integratedImportId,
    companyId,
    pageNumber,
    haveWhatsapp,
  });

  return res.status(200).json({ reports, count, hasMore });
};

type GetInfoQuery = {
  msgWhatsId: string,
  registerId: string,
  phone: string,
  companyId: string
}

export const getInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { msgWhatsId, registerId, phone, companyId } = req.query as GetInfoQuery;

  const response = await GetInfo({ msgWhatsId, registerId, phone, companyId });

  return res.status(200).json(response);
};

export const exportCSV = async (req: Request, res: Response): Promise<Response> => {
  const { fileId, integratedImportId, pageNumber, haveWhatsapp } = req.query as unknown as IndexQuery;
  const { companyId } = req.user;

  const { reports } = await ListFileRegistersService({
    fileId,
    integratedImportId,
    companyId,
    pageNumber,
    haveWhatsapp,
  });

  const rows = [["Nome", "Telefone", "CPF/CNPJ", "Tem Whatsapp?", "VAR 1", "VAR 2", "VAR 3", "VAR 4", "VAR 5"]];

  reports.forEach(register => {
    const { name, phoneNumber, documentNumber } = register;

    const haveWhatsapp = register.haveWhatsapp ? "SIM" : "NÃO";

    const columns = [];

    columns.push(name);
    columns.push(phoneNumber);
    columns.push(documentNumber);
    columns.push(haveWhatsapp);
    columns.push(register.var1);
    columns.push(register.var2);
    columns.push(register.var3);
    columns.push(register.var4);
    columns.push(register.var5);

    rows.push(columns);
  });

  let csvContent = "\uFEFF";

  rows.forEach(rowArray => {
    const row = rowArray.join(";");
    csvContent += `${row}\r\n`;
  });

  return res.status(200).json(csvContent);
};
