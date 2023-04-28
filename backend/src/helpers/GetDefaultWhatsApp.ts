import AppError from "../errors/AppError";
import Whatsapp from "../database/models/Whatsapp";

interface Request {
  companyId: number;
  whatsappId?: string;
  official?: boolean;
  queueId?: string | number;
}

const GetDefaultWhatsApp = async ({ companyId, whatsappId, official, queueId }: Request): Promise<Whatsapp> => {
  let whereCondition = null;

  whereCondition = { companyId, deleted: false };

  if (!official) {
    whereCondition = { ...whereCondition, status: "CONNECTED", official: false };
  }

  if (whatsappId) {
    whereCondition = { ...whereCondition, id: whatsappId };
  }

  if (queueId) {
    whereCondition = { ...whereCondition, queueId: queueId };
  }

  const defaultWhatsapp = await Whatsapp.findOne({
    where: whereCondition
  });

  if (!defaultWhatsapp) {
    throw new AppError("ERR_NO_CONNECTED_WHATS_FOUND");
  }

  return defaultWhatsapp;
};

export default GetDefaultWhatsApp;
