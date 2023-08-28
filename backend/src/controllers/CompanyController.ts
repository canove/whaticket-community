import { Request, Response } from "express";

import ListCompaniesService from "../services/CompanyService/CompanyService";

interface CompanyData {
  name: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const companies = await ListCompaniesService();

  return res.status(200).json(companies);
};
