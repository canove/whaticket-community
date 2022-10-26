import FlowsNodes from "../../database/models/FlowsNodes";
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
  const flowNode = await ShowFlowNodesService(flowId, companyId);

  const { json } = flowNodesData;

  await flowNode.update({
    json
  });

  flowNode.reload();

  return flowNode;
};

export default UpdateFlowNodesService;
