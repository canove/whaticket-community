import { Request, Response } from "express";
import ListTicketsReportService from "../services/TicketsReportService/ListTicketsReportService";

type IndexQuery = {
  ticketId: number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.query as unknown as IndexQuery;
  const { companyId } = req.user;

  const ticketsReport = await ListTicketsReportService({ ticketId, companyId });

  return res.status(200).json(ticketsReport);
};
