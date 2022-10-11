import { Request, Response } from "express";

import axios from "axios";
import ListIntegratedImportService from "../services/IntegratedImportService/ListIntegratedImportService";
import CreateIntegratedImportService from "../services/IntegratedImportService/CreateIntegratedImportService";
import ShowIntegratedImportService from "../services/IntegratedImportService/ShowIntegratedImportService";
import UpdateIntegratedImportService from "../services/IntegratedImportService/UpdateIntegratedImportService";
import DeleteIntegratedImportService from "../services/IntegratedImportService/DeleteIntegratedImportService";

import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

interface IntegratedImportData {
  name: string;
  method: string;
  qtdeRegister: number;
  status: number;
  url: string;
  key: string;
  token: string;
  mapping: string;
  companyId: string | number;
  config: string;
  body: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const integratedImport = await ListIntegratedImportService(companyId);

  return res.status(200).json(integratedImport);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    method,
    qtdeRegister,
    status,
    url,
    key,
    token,
    mapping
  }: IntegratedImportData = req.body;

  const { companyId } = req.user;

  const integratedImport = await CreateIntegratedImportService({
    name,
    method,
    qtdeRegister,
    status,
    url,
    key,
    token,
    mapping,
    companyId
  });

  const io = getIO();
  io.emit(`integratedImport${companyId}`, {
    action: "create",
    integratedImport
  });

  return res.status(200).json(integratedImport);
};

export const auth = async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).json("OK");
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { integratedImportId } = req.params;
  const { companyId } = req.user;

  const integratedImport = await ShowIntegratedImportService(
    integratedImportId,
    companyId
  );

  return res.status(200).json(integratedImport);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const importData: IntegratedImportData = req.body;
  const { integratedImportId } = req.params;
  const { companyId } = req.user;

  const integratedImport = await UpdateIntegratedImportService({
    importData,
    integratedImportId,
    companyId
  });

  const io = getIO();
  io.emit(`integratedImport${companyId}`, {
    action: "update",
    integratedImport
  });

  return res.status(200).json(integratedImport);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { integratedImportId } = req.params;
  const { companyId } = req.user;

  await DeleteIntegratedImportService(integratedImportId, companyId);

  const io = getIO();
  io.emit(`integratedImport${companyId}`, {
    action: "delete",
    integratedImportId
  });

  return res.status(200).json({ message: "Importation deleted" });
};
