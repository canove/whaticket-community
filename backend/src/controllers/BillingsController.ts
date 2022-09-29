import { Request, Response } from "express";

import ListBillingsService from "../services/BillingServices/ListBillingsService";

import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;

  if (user.profile !== "admin" || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const billings = await ListBillingsService();

  return res.status(200).json(billings);
};
