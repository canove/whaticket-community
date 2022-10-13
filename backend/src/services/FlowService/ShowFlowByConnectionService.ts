import Flows from "../../database/models/Flows";
import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";

const ShowFlowByConnectionService = async (
  connectionName: string
): Promise<Flows> => {
  const whatsapp = await Whatsapp.findOne({
    where: { name: connectionName, deleted: 0 }
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WHATSAPP_FOUND", 404);
  }

  const flow = await Flows.findOne({
    where: { id: whatsapp.flowId }
  });

  if (!flow) {
    throw new AppError("ERR_NO_FLOW_FOUND", 404);
  }

  if (flow.status !== "active") {
    throw new AppError("ERR_FLOW_INACTIVE", 404);
  }

  return flow;
};

export default ShowFlowByConnectionService;
