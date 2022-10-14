import Flows from "../../database/models/Flows";

interface Request {
  name: string;
  status: string;
  companyId: number;
  projectId: string;
  agentId: string;
  location: string;
  clientEmail: string;
  privateKey: string;
}

const CreateFlowService = async ({
  name,
  status,
  companyId,
  projectId,
  agentId,
  location,
  clientEmail,
  privateKey
}: Request): Promise<Flows> => {
  const flow = await Flows.create({
    name,
    status,
    companyId,
    projectId,
    agentId,
    location,
    clientEmail,
    privateKey
  });

  return flow;
};

export default CreateFlowService;
