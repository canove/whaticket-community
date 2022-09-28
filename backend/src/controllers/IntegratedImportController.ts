import { Request, Response } from "express";

import ListIntegratedImportService from "../services/IntegratedImportService/ListIntegratedImportService";
import CreateIntegratedImportService from "../services/IntegratedImportService/CreateIntegratedImportService";
import ShowIntegratedImportService from "../services/IntegratedImportService/ShowIntegratedImportService";
import UpdateIntegratedImportService from "../services/IntegratedImportService/UpdateIntegratedImportService";
import DeleteIntegratedImportService from "../services/IntegratedImportService/DeleteIntegratedImportService";

import { getIO } from "../libs/socket";

interface IntegratedImportData {
    name: string;
    method: string;
    qtdeRegister: number;
    status: number;
    url: string;
    key: string;
    token: string;
    mapping: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {

  const integratedImport = await ListIntegratedImportService();

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
    mapping,

  }: IntegratedImportData = req.body;

  const integratedImport = await CreateIntegratedImportService({
    name,
    method,
    qtdeRegister,
    status,
    url,
    key,
    token,
    mapping,
  });

  const io = getIO();
  io.emit("integratedImport", {
    action: "create",
    integratedImport
  });
  return res.status(200).json(integratedImport);
};

export const show = async (req: Request, res: Response): Promise<Response> => {

  const { integratedImportId } = req.params;

  const integratedImport = await ShowIntegratedImportService(integratedImportId);

  return res.status(200).json(integratedImport);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {;

  const importData: IntegratedImportData = req.body;
  const { integratedImportId } = req.params;

  const integratedImport = await UpdateIntegratedImportService({ importData, integratedImportId });

  const io = getIO();
  io.emit("integratedImport", {
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

  await DeleteIntegratedImportService(integratedImportId);

  const io = getIO();
  io.emit("integratedImport", {
    action: "delete",
    integratedImportId
  });

  return res.status(200).json({ message: "Importation deleted" });
};
