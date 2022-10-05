import { Request, Response } from "express";
import GreetingMessages from "../database/models/GreetingMessages";
import { getIO } from "../libs/socket";

import CreateWhatsConfigService from "../services/WhatsConfigService/CreateWhatsConfigService";
import DeleteConfigService from "../services/WhatsConfigService/DeleteConfigService";
import DeleteMessageService from "../services/WhatsConfigService/DeleteMessageService";
import ListWhatsConfigService from "../services/WhatsConfigService/ListWhatsConfigService";
import UpdateConfigService from "../services/WhatsConfigService/UpdateConfigService";

interface ConfigData {
  companyId: string | number;
  triggerInterval?: number;
  whatsappIds?: string;
  useGreetingMessages?: boolean;
  greetingMessages?: GreetingMessages[];
  active?: boolean;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const config = await ListWhatsConfigService(companyId);

  return res.status(200).json(config);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    triggerInterval,
    whatsappIds,
    useGreetingMessages,
    greetingMessages,
    active
  } = req.body as ConfigData;

  const { companyId } = req.user;

  const config = await CreateWhatsConfigService({
    triggerInterval,
    whatsappIds,
    useGreetingMessages,
    greetingMessages,
    active,
    companyId
  });

  const io = getIO();
  io.emit(`config${companyId}`, {
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
  const { companyId } = req.user;

  const config = await UpdateConfigService({ configData, configId });

  const io = getIO();
  io.emit(`config${companyId}`, {
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
  const { companyId } = req.body;

  await DeleteConfigService(configId);

  const io = getIO();
  io.emit(`config${companyId}`, {
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