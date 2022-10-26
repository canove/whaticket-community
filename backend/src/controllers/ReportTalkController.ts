import { Request, Response } from "express";
import ListReportService from "../services/ReportTalkService/ListReportService";

type IndexQuery = {
  id?: number;
  body?: string;
  mediaUrl?: string;
  read?: number| boolean;
  pageNumber?: boolean | number;
  number?: string;
  userId?: number;

};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { id, body, mediaUrl, read, pageNumber, number, userId } = req.query as IndexQuery;
  const { companyId } = req.user;
  const report = await ListReportService({
    id,
    body,
    mediaUrl,
    read,
    pageNumber,
    companyId,
    number,
    userId,

  });

  return res.status(200).json(report);
};
