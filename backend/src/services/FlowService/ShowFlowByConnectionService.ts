import Flows from "../../database/models/Flows";
import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";

const ShowFlowByConnectionService = async (
  whatsAppId: string | number,
  companyId: string | number
): Promise<Flows> => {
  const whatsapp = await Whatsapp.findOne({
    where: { id: whatsAppId, companyId }
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WHATSAPP_FOUND", 404);
  }

  const flow = await Flows.findOne({
    where: { id: whatsapp.flowId, companyId }
  });

  if (!flow) {
    throw new AppError("ERR_NO_FLOW_FOUND", 404);
  }

  return flow;
};

export default ShowFlowByConnectionService;
