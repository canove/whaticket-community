import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateChatbotOptionService from "../services/ChatbotOptionService/CreateChatbotOptionService";
import DeleteChatbotOptionService from "../services/ChatbotOptionService/DeleteChatbotOptionService";
import ListChatbotOptionService from "../services/ChatbotOptionService/ListChatbotOptionService";
import ShowChatbotOptionService from "../services/ChatbotOptionService/ShowChatbotOptionService";
import UpdateChatbotOptionService from "../services/ChatbotOptionService/UpdateChatbotOptionService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const chatbotOptions = await ListChatbotOptionService(req.body.queueId);

  return res.status(200).json(chatbotOptions);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, message, queueId, fatherChatbotOptionId } = req.body;

  const chatbotOption = await CreateChatbotOptionService({
    name,
    message,
    queueId,
    fatherChatbotOptionId
  });

  const io = getIO();
  io.emit("chatbotOption", {
    action: "update",
    chatbotOption
  });

  return res.status(200).json(chatbotOption);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { chatbotOptionId } = req.params;

  const chatbotOption = await ShowChatbotOptionService(chatbotOptionId);

  return res.status(200).json(chatbotOption);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { chatbotOptionId } = req.params;

  const chatbotOption = await UpdateChatbotOptionService({
    chatbotOptionId,
    chatbotOptionData: req.body
  });

  const io = getIO();
  io.emit("chatbotOption", {
    action: "update",
    chatbotOption
  });

  return res.status(201).json(chatbotOption);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { chatbotOptionId } = req.params;

  await DeleteChatbotOptionService(chatbotOptionId);

  const io = getIO();
  io.emit("chatbotOption", {
    action: "delete",
    chatbotOptionId: +chatbotOptionId
  });

  return res.status(200).send();
};
