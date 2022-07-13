import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import ListReportService from "../services/ReportTalkService/ListReportService";

type IndexQuery = {
  user: Number;
  initialDate: string;
  finalDate: string;
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { user, initialDate, finalDate } = req.query as unknown as IndexQuery;

    console.log(req.query)

  const report = await ListReportService({
    user,
    initialDate,
    finalDate,
  });


  return res.status(200).json(report);
};