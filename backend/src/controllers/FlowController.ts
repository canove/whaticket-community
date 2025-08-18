import { Request, Response } from "express";
import Flow from "../models/Flow";
import FlowNode from "../models/FlowNode";
import AIAgentService from "../services/AIAgentService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, nodes } = req.body;
  const flow = await Flow.create({ name });

  if (Array.isArray(nodes)) {
    for (const node of nodes) {
      await FlowNode.create({
        flowId: flow.id,
        type: node.type,
        config: node.config || {},
        positionX: node.positionX,
        positionY: node.positionY
      });
    }
  }

  const fullFlow = await Flow.findByPk(flow.id, { include: [FlowNode] });
  return res.status(201).json(fullFlow);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { flowId } = req.params;
  const flow = await Flow.findByPk(flowId, { include: [FlowNode] });
  if (!flow) {
    return res.status(404).json({ error: "Flow not found" });
  }
  return res.json(flow);
};

export const execute = async (req: Request, res: Response): Promise<Response> => {
  const { flowId } = req.params;
  const flow = await Flow.findByPk(flowId, { include: [FlowNode] });
  if (!flow) {
    return res.status(404).json({ error: "Flow not found" });
  }
  const results: Array<{ nodeId: number; result: any }> = [];
  for (const node of flow.nodes || []) {
    // eslint-disable-next-line no-await-in-loop
    const result = await AIAgentService.processNode(node);
    results.push({ nodeId: node.id, result });
  }
  return res.json({ flowId: flow.id, results });
};
