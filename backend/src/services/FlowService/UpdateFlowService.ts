import Flows from "../../database/models/Flows";
import ShowFlowService from "./ShowFlowService";

interface FlowsData {
  name: string;
  status: string;
}

interface Request {
  flowData: FlowsData;
  flowId: number | string;
  companyId: number | string;
}

const UpdateFlowService = async ({
  flowData,
  flowId,
  companyId
}: Request): Promise<Flows> => {
  const flow = await ShowFlowService(flowId, companyId);

  const { name, status } = flowData;

  await flow.update({
    name,
    status
  });

  flow.reload();

  return flow;
};

export default UpdateFlowService;
