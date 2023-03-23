import { Request, Response } from "express";
import ListReportService from "../services/ReportTalkService/ListReportService";

type IndexQuery = {
  pageNumber?: string, 
  initialDate?: string, 
  finalDate?: string, 
  userId?: string, 
  contactNumber?: string,
  company?: string
  categoryId?: string;
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, initialDate, finalDate, userId, contactNumber, company, categoryId } = req.query as IndexQuery;
  const { companyId } = req.user;

  const report = await ListReportService({
    pageNumber,
    companyId,
    contactNumber,
    userId,
    initialDate,
    finalDate,
    company,
    categoryId
  });

  return res.status(200).json(report);
};
