import FlowsNodes from "../../database/models/FlowsNodes";
import AppError from "../../errors/AppError";

const ShowFlowNodesService = async (
  id: string | number,
  companyId: string | number
): Promise<FlowsNodes> => {
  const flowNodes = await FlowsNodes.findOne({
    where: { flowId: id, companyId }
  });

  if (!flowNodes) {
    throw new AppError("ERR_NO_FLOW_FOUND", 404);
  }

  return flowNodes;
};

export default ShowFlowNodesService;
