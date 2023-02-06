import { Request, Response } from "express";

import ListBillingsService from "../services/BillingServices/ListBillingsService";
import ShowBillingsHistoricService from "../services/BillingServices/ShowBillingsHistoricService";
import ShowBillingsService from "../services/BillingServices/ShowBillingsService";

import AppError from "../errors/AppError";
import BillingControls from "../database/models/BillingControls";
import { Sequelize } from "sequelize-typescript";
import { Op } from "sequelize";
import Product from "../database/models/Products";
import Pricing from "../database/models/Pricing";
import Billings from "../database/models/Billings";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;

  if (user.profile !== 1 || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const billings = await ListBillingsService();

  return res.status(200).json(billings);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;
  const { billingId } = req.params;

  if (user.profile !== 1 || user.companyId !== 1) {
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

  if (user.profile !== 1 || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const billings = await ShowBillingsHistoricService(billingId);

  return res.status(200).json(billings);
};

type DashboardQuery = {
  selectedCompany: string;
}

export const dashboard = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { selectedCompany } = req.query as DashboardQuery;

  const comp = selectedCompany ? selectedCompany : companyId

  const { monthTotalValue, expectedTotalMonthValue } = await getMonthTotalValue(comp);
  const lastMonthTotalValue = await getLastMonthTotalValue(comp);

  return res.status(200).json({ monthTotalValue, expectedTotalMonthValue, lastMonthTotalValue });
};

const getLastMonthTotalValue = async (companyId: number | string) => {
  const now = new Date();
  const month = now.getMonth() === 0 ? 12 : now.getMonth();
  const year = month === 12 ? now.getFullYear() - 1 : now.getFullYear();

  const billing = await Billings.findOne({
    where: { 
      "$Billings.month$": Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("Billings.createdAt")), month.toString()),
      "$Billings.year$": Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("Billings.createdAt")), year.toString()),
      companyId
    }
  });

  if (billing) {
    const totalValue = billing.totalValue;

    return totalValue;
  }

  return 0;
}

const getMonthTotalValue = async (companyId: number | string) => {
  const now = new Date();
  const today = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const billingControls = await BillingControls.findAll({
      where: { 
          "$BillingControls.month$": Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("BillingControls.createdAt")), month.toString()),
          "$BillingControls.year$": Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("BillingControls.createdAt")), year.toString()),
          companyId
      }
  });

  let triggerTotal = 0;

  for (const billingControl of billingControls) {
      const graceTriggers = billingControl.usedGraceTriggers;
      const triggerFee = billingControl.triggerFee;
      const quantity = billingControl.quantity;

      triggerTotal = triggerTotal + (triggerFee * (quantity - graceTriggers));
  }

  const pricing = await Pricing.findOne({
    where: { companyId },
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["monthlyFee"],
        required: true
      },
    ]
  });

  if (!pricing) return { monthTotalValue: 0, expectedTotalMonthValue: 0 }
  
  const totalMonthValue = pricing.product.monthlyFee;
  const totalTriggerValue = triggerTotal;
  const monthTotalValue = totalMonthValue + totalTriggerValue;
  
  const expectedTotalMonthValue = ((totalTriggerValue / today) * 30) + totalMonthValue;

  return { monthTotalValue, expectedTotalMonthValue };
}
