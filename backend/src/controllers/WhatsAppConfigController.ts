import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateWhatsConfigService from "../services/WhatsConfigService/CreateWhatsConfigService";
import DeleteConfigService from "../services/WhatsConfigService/DeleteConfigService";
import DeleteMessageService from "../services/WhatsConfigService/DeleteMessageService";
import ListWhatsConfigService from "../services/WhatsConfigService/ListWhatsConfigService";
import UpdateConfigService from "../services/WhatsConfigService/UpdateConfigService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const config = await ListWhatsConfigService();

  return res.status(200).json(config);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    triggerInterval,
    whatsappIds,
    useGreetingMessages,
    greetingMessages
  } = req.body;

  const config = await CreateWhatsConfigService({
    triggerInterval,
    whatsappIds,
    useGreetingMessages,
    greetingMessages
  });

  const io = getIO();
  io.emit("config", {
    action: "create",
    config
  });

  return res.status(200).json(config);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { configId } = req.params;
  const configData = req.body;

  const config = await UpdateConfigService({ configData, configId });

  const io = getIO();
  io.emit("config", {
    action: "update",
    config
  });

  return res.status(200).json(config);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { configId } = req.params;

  await DeleteConfigService(configId);

  const io = getIO();
  io.emit("config", {
    action: "delete",
    configId
  });

  return res.status(200).json({ message: "Config deleted" });
};

export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  await DeleteMessageService(messageId);

  return res.status(200).json({ message: "Message deleted" });
};