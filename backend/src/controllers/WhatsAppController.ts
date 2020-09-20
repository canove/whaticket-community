import { Request, Response } from "express";

import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import FindWhatsAppService from "../services/WhatsappService/FindWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
// import Yup from "yup";
// import Whatsapp from "../models/Whatsapp";
// import { getIO } from "../libs/socket";
// import { getWbot, initWbot, removeWbot } from "../libs/wbot";
// import wbotMessageListener from "../services/wbotMessageListener";
// import wbotMonitor from "../services/wbotMonitor";

interface WhatsappData {
  name: string;
  status?: string;
  isDefault?: boolean;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const whatsapps = await ListWhatsAppsService();

  return res.status(200).json(whatsapps);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  // const io = getIO();

  const { name, status, isDefault }: WhatsappData = req.body;

  const whatsapp = await CreateWhatsAppService({ name, status, isDefault });

  // if (!whatsapp) {
  //   return res.status(400).json({ error: "Cannot create whatsapp session." });
  // }

  // initWbot(whatsapp)
  //   .then(() => {
  //     wbotMessageListener(whatsapp);
  //     wbotMonitor(whatsapp);
  //   })
  //   .catch(err => console.log(err));

  // io.emit("whatsapp", {
  //   action: "update",
  //   whatsapp: whatsapp
  // });

  return res.status(200).json(whatsapp);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  console.log(whatsappId);

  const whatsapp = await FindWhatsAppService(whatsappId);

  return res.status(200).json(whatsapp);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;

  const whatsapp = await UpdateWhatsAppService({ whatsappData, whatsappId });
  // const io = getIO();

  // const whatsapp = await Whatsapp.findByPk(whatsappId);

  // if (!whatsapp) {
  //   return res.status(404).json({ message: "Whatsapp not found" });
  // }

  // await whatsapp.update(req.body);

  // io.emit("whatsapp", {
  //   action: "update",
  //   whatsapp: whatsapp
  // });

  return res.status(200).json(whatsapp);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // const io = getIO();
  const { whatsappId } = req.params;

  await DeleteWhatsAppService(whatsappId);
  // removeWbot(whatsapp.id);

  // io.emit("whatsapp", {
  //   action: "delete",
  //   whatsappId: whatsapp.id
  // });

  return res.status(200).json({ message: "Whatsapp deleted." });
};
