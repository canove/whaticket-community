import Flows from "../../database/models/Flows";
import FlowsNodes from "../../database/models/FlowsNodes";

interface Request {
  name: string;
  status: string;
  companyId: number;
  projectId: string;
  agentId: string;
  location: string;
  clientEmail: string;
  privateKey: string;
  type: string;
}

const CreateFlowService = async ({
  name,
  status,
  companyId,
  projectId,
  agentId,
  location,
  clientEmail,
  privateKey,
  type
}: Request): Promise<Flows> => {
  const flow = await Flows.create({
    name,
    status,
    companyId,
    projectId,
    agentId,
    location,
    clientEmail,
    privateKey,
    type
  });

  if (type === "bits") {
    await FlowsNodes.create({
      flowId: flow.id,
      companyId: flow.companyId
    });
  }

  return flow;
};

export default CreateFlowService;
