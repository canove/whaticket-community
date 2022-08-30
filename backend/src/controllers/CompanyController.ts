import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CheckSettingsHelper from "../helpers/CheckSettings";
import AppError from "../errors/AppError";

import CreateCompanyService from "../services/CompanyService/CreateCompanyService";
import ListCompanyService from "../services/CompanyService/ListCompanyService";
import UpdateCompanyService from "../services/CompanyService/UpdateCompanyService";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";
import DeleteCompanyService from "../services/CompanyService/DeleteCompanyService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { companies, count, hasMore } = await ListCompanyService({
    searchParam,
    pageNumber
  });

  return res.json({ companies, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, cnpj, phone, email, address } = req.body;


  const company = await CreateCompanyService({
    name,
    cnpj,
    phone,
    email,
    address
  });

  const io = getIO();
  io.emit("company", {
    action: "create",
    company
  });

  return res.status(200).json(company);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.params;

  const company = await ShowCompanyService(companyId);

  return res.status(200).json(company);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {


  const { companyId } = req.params;
  const companyData = req.body;

  const company = await UpdateCompanyService({ companyData, companyId });

  const io = getIO();
  io.emit("company", {
    action: "update",
    company
  });

  return res.status(200).json(company);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.params;


  await DeleteCompanyService(companyId);

  const io = getIO();
  io.emit("company", {
    action: "delete",
    companyId
  });

  return res.status(200).json({ message: "Company deleted" });
};
