import Flows from "../../database/models/Flows";
import ShowFlowService from "./ShowFlowService";

interface FlowsData {
  name: string;
  status: string;
}

interface Request {
  flowData: FlowsData;
  flowId: number | string;
}

const UpdateFlowService = async ({
  flowData,
  flowId
}: Request): Promise<Flows> => {
  const flow = await ShowFlowService(flowId);

  const { name, status } = flowData;

  await flow.update({
    name,
    status
  });

  flow.reload();

  return flow;
};

export default UpdateFlowService;
