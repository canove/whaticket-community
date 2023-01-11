import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

import ListOfficialWhatsappReportsService from "../services/OfficialWhatsappServices/ListOfficialWhatsappReportsService";

type IndexQuery = {
    pageNumber: string;
    limit: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { pageNumber, limit } = req.query as IndexQuery;
    const { companyId } = req.user;
  
    const reports = await ListOfficialWhatsappReportsService({ companyId, pageNumber, limit });
  
    return res.status(200).json(reports);
}
