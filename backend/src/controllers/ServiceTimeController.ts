import { Request, Response } from "express";
import ListQueueTicketHistoricService from "../services/TicketHistoricsServices/ListQueueTicketHistoricService";

export const queue = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const report = await ListQueueTicketHistoricService({ companyId });

  return res.status(200).json(report);
};
