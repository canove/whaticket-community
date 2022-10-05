import Flows from "../../database/models/Flows";
import AppError from "../../errors/AppError";

const ShowFlowService = async (id: string | number): Promise<Flows> => {
  const flow = await Flows.findByPk(id);

  if (!flow) {
    throw new AppError("ERR_NO_FLOW_FOUND", 404);
  }

  return flow;
};

export default ShowFlowService;
