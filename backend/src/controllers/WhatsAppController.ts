import { Request, Response } from "express";
import { getIO } from "../libs/socket.js";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession.js";

import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService.js";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService.js";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService.js";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService.js";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService.js";
import { getProvider } from "../providers/WhatsApp/index.js";

interface WhatsappData {
  name: string;
  queueIds: number[];
  greetingMessage?: string;
  farewellMessage?: string;
  status?: string;
  isDefault?: boolean;
  channel?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const whatsapps = await ListWhatsAppsService();

  return res.status(200).json(whatsapps);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    status,
    isDefault,
    greetingMessage,
    farewellMessage,
    queueIds,
    channel
  }: WhatsappData = req.body;

  const { whatsapp, oldDefaultWhatsapp } = await CreateWhatsAppService({
    name,
    status,
    isDefault,
    greetingMessage,
    farewellMessage,
    queueIds,
    channel
  });

  StartWhatsAppSession(whatsapp);

  const io = getIO();
  io.to("notification").emit("whatsapp", {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.to("notification").emit("whatsapp", {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  const whatsapp = await ShowWhatsAppService(whatsappId);

  return res.status(200).json(whatsapp);
};

export const update = async (
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
  io.to("notification").emit("whatsapp", {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.to("notification").emit("whatsapp", {
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

  const whatsappToDelete = await ShowWhatsAppService(whatsappId);
  await DeleteWhatsAppService(whatsappId);
  getProvider(whatsappToDelete.channel || "whatsapp").removeSession(
    +whatsappId
  );

  const io = getIO();
  io.to("notification").emit("whatsapp", {
    action: "delete",
    whatsappId: +whatsappId
  });

  return res.status(200).json({ message: "Whatsapp deleted." });
};
