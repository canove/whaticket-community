import { Request, Response } from "express";
// import Whatsapp from "../models/Whatsapp";
// import { getIO } from "../libs/socket";
import { getWbot } from "../libs/wbot";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
// import wbotMonitor from "../services/wbotMonitor";

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await ShowWhatsAppService(whatsappId);

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await ShowWhatsAppService(whatsappId);

  const wbot = getWbot(whatsapp.id);

  wbot.logout();

  return res.status(200).json({ message: "Session disconnected." });
};

export default { store, remove };
