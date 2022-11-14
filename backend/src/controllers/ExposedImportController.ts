import { Request, Response } from "express";

import ListExposedImportsService from "../services/ExposedImportService/ListExposedImportsService";
import CreateExposedImportService from "../services/ExposedImportService/CreateExposedImportService";
import ShowExposedImportService from "../services/ExposedImportService/ShowExposedImportService";
import UpdateExposedImportService from "../services/ExposedImportService/UpdateExposedImportService";
import DeleteExposedImportService from "../services/ExposedImportService/DeleteExposedImportService";
import StartExposedImportService from "../services/ExposedImportService/StartExposedImportService";

import { getIO } from "../libs/socket";

type IndexQuery = {
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { exposedImports, count, hasMore } = await ListExposedImportsService({
    companyId,
    pageNumber
  });

  return res.status(200).json({ exposedImports, count, hasMore });
};

interface ExposedImportData {
  name: string;
  mapping: string;
  template: string;
  connections: string[];
  connectionType: string | boolean;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    mapping,
    template,
    connections,
    connectionType
  }: ExposedImportData = req.body;

  const { companyId } = req.user;

  const exposedImport = await CreateExposedImportService({
    name,
    mapping,
    template,
    connections,
    connectionType,
    companyId
  });

  const io = getIO();
  io.emit(`exposedImport${companyId}`, {
    action: "create",
    exposedImport
  });

  return res.status(200).json(exposedImport);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { exposedImportId } = req.params;
  const { companyId } = req.user;

  const exposedImport = await ShowExposedImportService(
    exposedImportId,
    companyId
  );

  return res.status(200).json(exposedImport);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const exposedImportData = req.body;
  const { exposedImportId } = req.params;
  const { companyId } = req.user;

  const exposedImport = await UpdateExposedImportService({
    exposedImportData,
    exposedImportId,
    companyId
  });

  const io = getIO();
  io.emit(`exposedImport${companyId}`, {
    action: "update",
    exposedImport
  });

  return res.status(200).json(exposedImport);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { exposedImportId } = req.params;
  const { companyId } = req.user;

  await DeleteExposedImportService(exposedImportId, companyId);

  const io = getIO();
  io.emit(`exposedImport${companyId}`, {
    action: "delete",
    exposedImportId
  });

  return res.status(200).json({ message: "Importation deleted" });
};

export const start = async (req: Request, res: Response): Promise<Response> => {
  const { exposedImportId } = req.params;
  const { companyId } = req.user;
  const payload = req.body;

  const exposedImport = await StartExposedImportService({
    exposedImportId,
    companyId,
    payload
  });

  const io = getIO();
  io.emit(`exposedImport${companyId}`, {
    action: "update",
    exposedImport
  });

  return res.status(200).json({ message: "request was received with success" });
};
