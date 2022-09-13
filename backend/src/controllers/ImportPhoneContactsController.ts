import { Request, Response } from "express";
import ImportContactsService from "../services/WbotServices/ImportContactsService";

type CompanyIdQuery = {
  companyId: string | number;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.body as CompanyIdQuery;

  await ImportContactsService({ companyId });

  return res.status(200).json({ message: "contacts imported" });
};
