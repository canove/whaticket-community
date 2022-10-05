import Flows from "../../database/models/Flows";

interface Request {
  name: string;
  status: string;
  companyId: number;
}

const CreateFlowService = async ({
  name,
  status,
  companyId
}: Request): Promise<Flows> => {
  const flow = await Flows.create({
    name,
    status,
    companyId
  });

  return flow;
};

export default CreateFlowService;
