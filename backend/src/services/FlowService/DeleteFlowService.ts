import Flows from "../../database/models/Flows";
import AppError from "../../errors/AppError";

const DeleteFlowService = async (id: string | number): Promise<void> => {
  const flow = await Flows.findOne({
    where: { id }
  });

  if (!flow) {
    throw new AppError("ERR_NO_FLOW_FOUND", 404);
  }

  await flow.destroy();
};

export default DeleteFlowService;
