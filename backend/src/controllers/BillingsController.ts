import { Request, Response } from "express";

import ListBillingsService from "../services/BillingServices/ListBillingsService";
import ShowBillingsHistoricService from "../services/BillingServices/ShowBillingsHistoricService";
import ShowBillingsService from "../services/BillingServices/ShowBillingsService";

import AppError from "../errors/AppError";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;

  if (user.profile !== "admin" || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const billings = await ListBillingsService();

  return res.status(200).json(billings);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;
  const { billingId } = req.params;

  if (user.profile !== "admin" || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const billing = await ShowBillingsService(billingId);

  return res.status(200).json(billing);
};

export const historic = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { user } = req;
  const { billingId } = req.params;

  if (user.profile !== "admin" || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const billings = await ShowBillingsHistoricService(billingId);

  return res.status(200).json(billings);
};
