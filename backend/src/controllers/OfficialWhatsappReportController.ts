import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

import ListOfficialWhatsappReportsService from "../services/OfficialWhatsappServices/ListOfficialWhatsappReportsService";

type IndexQuery = {
    pageNumber: string;
    limit: string;
    phoneNumber: string;
    clientPhoneNumber: string;
    initialDate: string;
    finalDate: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { pageNumber, limit, phoneNumber, clientPhoneNumber, initialDate, finalDate } = req.query as IndexQuery;
    const { companyId } = req.user;
  
    const reports = await ListOfficialWhatsappReportsService({ companyId, pageNumber, limit, phoneNumber, clientPhoneNumber, initialDate, finalDate });
  
    return res.status(200).json(reports);
}
