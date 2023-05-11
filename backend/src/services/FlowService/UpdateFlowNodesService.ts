import FlowsNodes from "../../database/models/FlowsNodes";
import AppError from "../../errors/AppError";
import ShowFlowNodesService from "./ShowFlowNodesService";

interface FlowsNodesData {
  json: string;
}

interface Request {
  flowNodesData: FlowsNodesData;
  flowId: number | string;
  companyId: number | string;
}

const UpdateFlowNodesService = async ({
  flowNodesData,
  flowId,
  companyId
}: Request): Promise<FlowsNodes> => {
  const nodes = await FlowsNodes.findOne({
    where: { flowId, companyId }
  });

  if (!nodes) throw new AppError("ERR_NO_FLOW_FOUND");

  const { json } = flowNodesData;

  console.log("update flowNode flowNodeService 23");
  await nodes.update({ json });

  nodes.reload();

  return nodes;
};

export default UpdateFlowNodesService;
