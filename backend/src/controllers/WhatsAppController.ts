import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { removeWbot } from "../libs/wbot";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";

import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";

interface WhatsappData {
  name: string;
  queueIds: number[];
  greetingMessage?: string;
  farewellMessage?: string;
  status?: string;
  isDefault?: boolean;
}

export const fetchAllWhatsAppEntries = async (req: Request, res: Response): Promise<Response> => {
  const whatsapps = await ListWhatsAppsService();

  return res.status(200).json(whatsapps);
};

export const createWhatsAppEntry = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    status,
    isDefault,
    greetingMessage,
    farewellMessage,
    queueIds
  }: WhatsappData = req.body;

  const { whatsapp, oldDefaultWhatsapp } = await CreateWhatsAppService({
    name,
    status,
    isDefault,
    greetingMessage,
    farewellMessage,
    queueIds
  });

  StartWhatsAppSession(whatsapp);

  const io = getIO();
  io.emit("whatsapp", {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.emit("whatsapp", {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const getAndShowWhatsAppDetails = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  const whatsapp = await ShowWhatsAppService(whatsappId);

  return res.status(200).json(whatsapp);
};

export const updateAndNotifyWhatsApp = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;

  const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId
  });

  const io = getIO();
  io.emit("whatsapp", {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.emit("whatsapp", {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;

  await DeleteWhatsAppService(whatsappId);
  removeWbot(+whatsappId);

  const io = getIO();
  io.emit("whatsapp", {
    action: "delete",
    whatsappId: +whatsappId
  });

  return res.status(200).json({ message: "Whatsapp deleted." });
};
