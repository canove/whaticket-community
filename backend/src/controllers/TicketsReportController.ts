import { Request, Response } from "express";
import ListTicketsReportService from "../services/TicketsReportService/ListTicketsReportService";

type IndexQuery = {
    ticketId: Number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { ticketId } = req.query as unknown as IndexQuery;

    const ticketsReport = await ListTicketsReportService({ ticketId });

    return res.status(200).json(ticketsReport)
}
