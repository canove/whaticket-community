/*eslint-disable */
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateFlowService from "../services/FlowService/CreateFlowService";
import DeleteFlowService from "../services/FlowService/DeleteFlowService";

import ListFlowsService from "../services/FlowService/ListFlowsService";
import ShowFlowByConnectionService from "../services/FlowService/ShowFlowByConnectionService";
import ShowFlowService from "../services/FlowService/ShowFlowService";
import StartFlowService from "../services/FlowService/StartFlowService";
import UpdateFlowService from "../services/FlowService/UpdateFlowService";

interface FlowsData {
  name: string;
  status: string;
  projectId: string;
  agentId: string;
  location: string;
  clientEmail: string;
  privateKey: string;
  type: string;
}

type IndexQuery = {
  searchParam: string;
  type: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam, type } = req.query as IndexQuery;

  const flows = await ListFlowsService({ companyId, searchParam, type });

  return res.status(200).json(flows);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const {
    name,
    status,
    projectId,
    agentId,
    location,
    clientEmail,
    privateKey,
    type
  }: FlowsData = req.body;

  const flow = await CreateFlowService({
    name,
    status,
    companyId,
    projectId,
    agentId,
    location,
    clientEmail,
    privateKey,
    type
  });

  const io = getIO();
  io.emit(`flows${companyId}`, {
    action: "create",
    flow
  });

  return res.status(200).json(flow);
};

export const connection = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const { connectionName } = req.params;

  const flow = await ShowFlowByConnectionService(connectionName);

  return res.status(200).json(flow);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { flowId } = req.params;
  const { companyId } = req.user;

  const flow = await ShowFlowService(flowId, companyId);

  return res.status(200).json(flow);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const flowData: FlowsData = req.body;
  const { flowId } = req.params;

  const flow = await UpdateFlowService({ flowData, flowId, companyId });

  const io = getIO();
  io.emit(`flows${companyId}`, {
    action: "update",
    flow
  });

  return res.status(200).json(flow);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { flowId } = req.params;

  await DeleteFlowService(flowId, companyId);

  const io = getIO();
  io.emit(`flows${companyId}`, {
    action: "delete",
    flowId
  });

  return res.status(200).json({ message: "Flow deleted" });
};

type StartQuery = {
  sessionId: string;
};

export const start = async (req: Request, res: Response): Promise<Response> => {
  const { flowNodeId } = req.params;
  const { sessionId } = req.body as StartQuery;
  const { companyId } = req.user;

  const response = await StartFlowService({
    flowNodeId,
    sessionId,
    companyId,
    body: req.body
  });

  return res.status(200).json(response);
};
