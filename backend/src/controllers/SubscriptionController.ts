import { Request, Response } from "express";
import express from "express";
import * as Yup from "yup";
import Gerencianet from "gn-api-sdk-typescript";
import AppError from "../errors/AppError";

import options from "../config/Gn";
import Company from "../models/Company";
import Invoices from "../models/Invoices";
import Subscriptions from "../models/Subscriptions";
import { getIO } from "../libs/socket";
import UpdateUserService from "../services/UserServices/UpdateUserService";

const app = express();


export const index = async (req: Request, res: Response): Promise<Response> => {
  const gerencianet = Gerencianet(options);
  return res.json(gerencianet.getSubscriptions());
};

export const createSubscription = async (
  req: Request,
  res: Response
  ): Promise<Response> => {
    const gerencianet = Gerencianet(options);
    const { companyId } = req.user;

  const schema = Yup.object().shape({
    price: Yup.string().required(),
    users: Yup.string().required(),
    connections: Yup.string().required()
  });

  if (!(await schema.isValid(req.body))) {
    console.log("Erro linha 32")
    throw new AppError("Validation fails", 400);
  }

  const {
    firstName,
    price,
    users,
    connections,
    address2,
    city,
    state,
    zipcode,
    country,
    plan,
    invoiceId
  } = req.body;

  const body = {
    calendario: {
      expiracao: 3600
    },
    valor: {
      original: price.toLocaleString("pt-br", { minimumFractionDigits: 2 }).replace(",", ".")
    },
    chave: process.env.GERENCIANET_PIX_KEY,
    solicitacaoPagador: `#Fatura:${invoiceId}`
    };
  try {
    const pix = await gerencianet.pixCreateImmediateCharge(null, body);

    const qrcode = await gerencianet.pixGenerateQRCode({
      id: pix.loc.id
    });

    const updateCompany = await Company.findOne();

    if (!updateCompany) {
      throw new AppError("Company not found", 404);
    }


/*     await Subscriptions.create({
      companyId,
      isActive: false,
      userPriceCents: users,
      whatsPriceCents: connections,
      lastInvoiceUrl: pix.location,
      lastPlanChange: new Date(),
      providerSubscriptionId: pix.loc.id,
      expiresAt: new Date()
    }); */

/*     const { id } = req.user;
    const userData = {};
    const userId = id;
    const requestUserId = parseInt(id);
    const user = await UpdateUserService({ userData, userId, companyId, requestUserId }); */

    /*     const io = getIO();
        io.emit("user", {
          action: "update",
          user
        }); */


    return res.json({
      ...pix,
      qrcode,

    });
  } catch (error) {
    console.log(error);
    throw new AppError("Problema encontrado, entre em contato com o suporte!", 400);
  }
};

export const createWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const schema = Yup.object().shape({
    chave: Yup.string().required(),
    url: Yup.string().required()
  });

  if (!(await schema.isValid(req.body))) {
    throw new AppError("Validation fails", 400);
  }

  const { chave, url } = req.body;

  const body = {
    webhookUrl: url
  };

  const params = {
    chave
  };

  try {
    const gerencianet = Gerencianet(options);
    const create = await gerencianet.pixConfigWebhook(params, body);
    return res.json(create);
  } catch (error) {
    console.log(error);
  }
};

export const webhook = async (
  req: Request,
  res: Response
  ): Promise<Response> => {
  const { type } = req.params;
  const { evento } = req.body;
  if (evento === "teste_webhook") {
    return res.json({ ok: true });
  }
  if (req.body.pix) {
    const gerencianet = Gerencianet(options);
    req.body.pix.forEach(async (pix: any) => {
      const detahe = await gerencianet.pixDetailCharge({
        txid: pix.txid
      });

      if (detahe.status === "CONCLUIDA") {
        const { solicitacaoPagador } = detahe;
        const invoiceID = solicitacaoPagador.replace("#Fatura:", "");
        const invoices = await Invoices.findByPk(invoiceID);
        const companyId =invoices.companyId;
        const company = await Company.findByPk(companyId);
    
        const expiresAt = new Date(company.dueDate);
        expiresAt.setDate(expiresAt.getDate() + 30);
        const date = expiresAt.toISOString().split("T")[0];

        if (company) {
          await company.update({
            dueDate: date
          });
         const invoi = await invoices.update({
            id: invoiceID,
            status: 'paid'
          });
          await company.reload();
          const io = getIO();
          const companyUpdate = await Company.findOne({
            where: {
              id: companyId
            }
          });

          io.emit(`company-${companyId}-payment`, {
            action: detahe.status,
            company: companyUpdate
          });
        }

      }
    });

  }

  return res.json({ ok: true });
};
