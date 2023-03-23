import { Request, Response } from "express";
import AppError from "../errors/AppError";
import ListTicketsReportService from "../services/TicketsReportService/ListTicketsReportService";

type IndexQuery = {
  ticketId: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.query as IndexQuery;
  const { companyId } = req.user;

  if (!ticketId) throw new AppError("NO_TICKET_SELECTED");

  const ticketsReport = await ListTicketsReportService({ ticketId, companyId });

  return res.status(200).json(ticketsReport);
};
