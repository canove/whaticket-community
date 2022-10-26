import { Request, Response } from "express";

import ShowFlowNodesService from "../services/FlowService/ShowFlowNodesService";
import UpdateFlowNodesService from "../services/FlowService/UpdateFlowNodesService";

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { flowId } = req.params;
  const { companyId } = req.user;

  const flowNodes = await ShowFlowNodesService(flowId, companyId);

  return res.status(200).json(flowNodes);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const flowNodesData = req.body;
  const { flowId } = req.params;

  const flowNodes = await UpdateFlowNodesService({
    flowNodesData,
    flowId,
    companyId
  });

  return res.status(200).json(flowNodes);
};
