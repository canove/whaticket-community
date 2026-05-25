import { Request, Response } from "express";
import { getProvider } from "../providers/WhatsApp/index.js";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService.js";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession.js";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService.js";

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

  await getProvider(whatsapp.channel || "whatsapp").logout(whatsapp.id);

  return res.status(200).json({ message: "Session disconnected." });
};

export default { store, remove, update };
