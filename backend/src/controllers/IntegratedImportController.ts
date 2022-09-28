import { Request, Response } from "express";

import ListIntegratedImportService from "../services/IntegratedImportService/ListIntegratedImportService";
import CreateIntegratedImportService from "../services/IntegratedImportService/CreateIntegratedImportService";
import ShowIntegratedImportService from "../services/IntegratedImportService/ShowIntegratedImportService";
import UpdateIntegratedImportService from "../services/IntegratedImportService/UpdateIntegratedImportService";
import DeleteIntegratedImportService from "../services/IntegratedImportService/DeleteIntegratedImportService";

import { getIO } from "../libs/socket";

interface IntegratedImportData {

    id: number;
    name: string;
    method: string;
    qtdeRegister: number;
    status: number;
    url: string;
    key: string;
    token: string;
    mapping: string;
    createdAt: Date;
};

export const index = async (req: Request, res: Response): Promise<Response> => {

  const integratedImport = await ListIntegratedImportService();

  return res.status(200).json(integratedImport);
};

export const store = async (req: Request, res: Response): Promise<Response> => {

  const {
    id,
    name,
    method,
    qtdeRegister,
    status,
    url,
    key,
    token,
    mapping,
    createdAt,
  }: IntegratedImportData = req.body;

  const integratedImport = await CreateIntegratedImportService({
    id,
    name,
    method,
    qtdeRegister,
    status,
    url,
    key,
    token,
    mapping,
    createdAt,
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
