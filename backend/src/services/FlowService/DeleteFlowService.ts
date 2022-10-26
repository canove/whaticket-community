import Flows from "../../database/models/Flows";
import FlowsNodes from "../../database/models/FlowsNodes";
import AppError from "../../errors/AppError";

const DeleteFlowService = async (
  id: string | number,
  companyId: string | number
): Promise<void> => {
  const flow = await Flows.findOne({
    where: { id, companyId }
  });

  if (!flow) {
    throw new AppError("ERR_NO_FLOW_FOUND", 404);
  }

  if (flow.type === "bits") {
    const flowNodes = await FlowsNodes.findOne({
      where: { flowId: flow.id }
    });

    await flowNodes.destroy();
  }

  await flow.destroy();
};

export default DeleteFlowService;
