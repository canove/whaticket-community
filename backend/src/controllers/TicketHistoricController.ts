import { Request, Response } from "express";
import ListTicketHistoricService from "../services/TicketHistoricsServices/ListTicketHistoricService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const report = await ListTicketHistoricService({
    companyId
  });

  return res.status(200).json(report);
};
