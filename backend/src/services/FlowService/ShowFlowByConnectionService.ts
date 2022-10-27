/* eslint-disable no-restricted-syntax */
import Flows from "../../database/models/Flows";
import FlowsNodes from "../../database/models/FlowsNodes";
import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";

const ShowFlowByConnectionService = async (
  connectionName: string
): Promise<any> => {
  const whatsapp = await Whatsapp.findOne({
    where: { name: connectionName, deleted: 0 }
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WHATSAPP_FOUND", 404);
  }

  const flow = await Flows.findOne({
    where: { id: whatsapp.flowId }
  });

  if (!flow) {
    throw new AppError("ERR_NO_FLOW_FOUND", 404);
  }

  if (flow.status !== "active") {
    throw new AppError("ERR_FLOW_INACTIVE", 404);
  }

  if (flow.type === "bits") {
    const flowNodes = await FlowsNodes.findOne({
      where: { flowId: flow.id, companyId: flow.companyId }
    });

    const flowNodesOBJ = flowNodes.json ? JSON.parse(flowNodes.json) : null;

    if (!flowNodesOBJ) {
      throw new AppError("ERR_NO_FLOW_NODES", 404);
    }

    const nodes = flowNodesOBJ.layers[1].models;

    const firstNodeId = Object.keys(nodes).find((nodeId: any) => {
      if (nodes[nodeId].main) {
        return nodes[nodeId];
      }
      return false;
    });

    return {
      id: flow.id,
      companyId: flow.companyId,
      name: flow.name,
      status: flow.status,
      type: flow.type,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
      url: nodes[firstNodeId].url,
      header: JSON.parse(nodes[firstNodeId].header)
    };
  }

  return flow;
};

export default ShowFlowByConnectionService;
