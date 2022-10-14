import Flows from "../../database/models/Flows";
import ShowFlowService from "./ShowFlowService";

interface FlowsData {
  name: string;
  status: string;
  projectId: string;
  agentId: string;
  location: string;
  clientEmail: string;
  privateKey: string;
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

  const {
    name,
    status,
    projectId,
    agentId,
    location,
    clientEmail,
    privateKey
  } = flowData;

  await flow.update({
    name,
    status,
    projectId,
    agentId,
    location,
    clientEmail,
    privateKey
  });

  flow.reload();

  return flow;
};

export default UpdateFlowService;
