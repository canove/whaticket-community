import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateDialogflowService from "../services/DialogflowServices/CreateDialogflowService";
import DeleteDialogflowService from "../services/DialogflowServices/DeleteDialogflowService";
import ListDialogflowsService from "../services/DialogflowServices/ListDialogflowService";
import ShowDialogflowService from "../services/DialogflowServices/ShowDialogflowService";
import TestSessionDialogflowService from "../services/DialogflowServices/TestSessionDialogflowService";
import UpdateDialogflowService from "../services/DialogflowServices/UpdateDialogflowService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const dialogflows = await ListDialogflowsService();

  return res.status(200).json(dialogflows);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, projectName, jsonContent, language } = req.body;

  const dialogflow = await CreateDialogflowService({ name, projectName, jsonContent, language });

  const io = getIO();
  io.emit("dialogflow", {
    action: "update",
    dialogflow
  });

  return res.status(200).json(dialogflow);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { dialogflowId } = req.params;

  const dialogflow = await ShowDialogflowService(dialogflowId);

  return res.status(200).json(dialogflow);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { dialogflowId } = req.params;
  const dialogflowData = req.body;

  const dialogflow = await UpdateDialogflowService({dialogflowData, dialogflowId });

  const io = getIO();
  io.emit("dialogflow", {
    action: "update",
    dialogflow
  });

  return res.status(201).json(dialogflow);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { dialogflowId } = req.params;

  await DeleteDialogflowService(dialogflowId);

  const io = getIO();
  io.emit("dialogflow", {
    action: "delete",
    dialogflowId: +dialogflowId
  });

  return res.status(200).send();
};

export const testSession = async (req: Request, res: Response): Promise<Response> => {
  const { projectName, jsonContent, language } = req.body;

  const response = await TestSessionDialogflowService({ projectName, jsonContent, language });

  const io = getIO();
  io.emit("dialogflow", {
    action: "testSession",
    response
  });

  return res.status(200).json(response);
};
