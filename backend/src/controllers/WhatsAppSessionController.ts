import axios from "axios";
import { Request, Response } from "express";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import TestWhatsAppConnectionService from "../services/WhatsappService/TestWhatsAppConnectionService";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";

type IndexQuery = {
  facebookToken: string;
  facebookPhoneNumberId: string;
  facebookBusinessId: string;
};

const index = async (req: Request, res: Response): Promise<Response> => {
  const { facebookToken, facebookPhoneNumberId, facebookBusinessId } =
    req.query as IndexQuery;

  const response = await TestWhatsAppConnectionService({
    facebookToken,
    facebookPhoneNumberId,
    facebookBusinessId
  });

  return res.status(200).json(response);
};

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  StartWhatsAppSession(whatsapp, null);

  return res.status(200).json({ message: "Starting session." });
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const { service } = req.body;

  // FAZER VALIDAÇÃO PARA VER SE TEM SLOT DISPONIVEL PARA CRIAR O CHIP
  
  const whats = await ShowWhatsAppService(whatsappId, companyId);

  const apiUrl = `${process.env.WPPNOF_URL}/checkAvailableCompany`;

  const payload = {
    companyId,
    service
  };

  if(!whats.official) {
    try {
      await axios.post(apiUrl, payload, {
        headers: {
          "api-key": `${process.env.WPPNOF_API_TOKEN}`,
          sessionkey: `${process.env.WPPNOF_SESSION_KEY}`
        }
      });
    } catch (err: any) {
        if(!err.response.data["message"]){
          throw new AppError("Ocorreu um erro ao tentar se comunicar com Firebase!");
        }
      throw new AppError(err.response.data.message);
    }
  }

  const { whatsapp } = await UpdateWhatsAppService({
    whatsappId,
    whatsappData: { session: "" },
    companyId
  });

  StartWhatsAppSession(whatsapp, service);

  return res.status(200).json({ message: "Starting session." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  try {
    const apiUrl = `${process.env.WPPNOF_URL}/stop`;
    const payload = {
      session: whatsapp.name,
      companyId: whatsapp.companyId
    };

    await axios.post(apiUrl, payload, {
      headers: {
        "api-key": `${process.env.WPPNOF_API_TOKEN}`,
        sessionkey: `${process.env.WPPNOF_SESSION_KEY}`
      }
    });
  } catch (err) {
    logger.error(err);
  }

  /* const wbot = getWbot(whatsapp.id);

  wbot.logout(); */

  return res.status(200).json({ message: "Session disconnected." });
};

export default { index, store, remove, update };
