import axios from "axios";
import { Request, Response } from "express";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import TestWhatsAppConnectionService from "../services/WhatsappService/TestWhatsAppConnectionService";
import { logger } from "../utils/logger";

/*eslint-disable*/
const index = async (req: Request, res: Response): Promise<Response> => {
  const { facebookToken, facebookPhoneNumberId, facebookBusinessId } = req.query;

  const response = await TestWhatsAppConnectionService({ facebookToken, facebookPhoneNumberId, facebookBusinessId });

  return res.status(200).json(response);
}

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await ShowWhatsAppService(whatsappId);

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  const { whatsapp } = await UpdateWhatsAppService({
    whatsappId,
    whatsappData: { session: "" }
  });

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await ShowWhatsAppService(whatsappId);

  try {
    const apiUrl = `${process.env.WPPNOF_URL}/stop`;
    const payload = {
      session: whatsapp.name,
      companyId: whatsapp.companyId
    };

    await axios.post(apiUrl, payload, { headers: {
      "api-key": `${process.env.WPPNOF_API_TOKEN}`,
      "sessionkey": `${process.env.WPPNOF_SESSION_KEY}`
    }});
  } catch (err) {
    logger.error(err);
  }

  /*const wbot = getWbot(whatsapp.id);

  wbot.logout();*/

  return res.status(200).json({ message: "Session disconnected." });
};

export default { index, store, remove, update };
