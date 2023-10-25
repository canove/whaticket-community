import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import ListService from "../services/HelpServices/ListService";
import CreateService from "../services/HelpServices/CreateService";
import ShowService from "../services/HelpServices/ShowService";
import UpdateService from "../services/HelpServices/UpdateService";
import DeleteService from "../services/HelpServices/DeleteService";
import FindService from "../services/HelpServices/FindService";

import Help from "../models/Help";

import AppError from "../errors/AppError";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type StoreData = {
  title: string;
  description: string;
  video?: string;
  link?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { records, count, hasMore } = await ListService({
    searchParam,
    pageNumber
  });
  return res.json({ records, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body as StoreData;

  const schema = Yup.object().shape({
    title: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (err) {
    throw new AppError(err.message);
  }

  const record = await CreateService({
    ...data
  });

  const io = getIO();
  io.emit(`company-${companyId}-help`, {
    action: "create",
    record
  });

  return res.status(200).json(record);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const record = await ShowService(id);

  return res.status(200).json(record);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body as StoreData;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    title: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (err) {
    throw new AppError(err.message);
  }

  const { id } = req.params;

  const record = await UpdateService({
    ...data,
    id
  });

  const io = getIO();
  io.emit(`company-${companyId}-help`, {
    action: "update",
    record
  });

  return res.status(200).json(record);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id);

  const io = getIO();
  io.emit(`company-${companyId}-help`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "Help deleted" });
};

export const findList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const records: Help[] = await FindService();

  return res.status(200).json(records);
};
