import AppError from "../errors/AppError";
import Whatsapp from "../database/models/Whatsapp";
import Queue from "../database/models/Queue";

interface Request {
  companyId: number;
  whatsappId?: string;
  official?: boolean;
  queueId?: string | number;
}

const GetDefaultWhatsApp = async ({ companyId, whatsappId, official, queueId }: Request): Promise<Whatsapp> => {
  let whereCondition = null;
  let includeCondition = [];

  whereCondition = { companyId, deleted: false };

  if (!official) {
    whereCondition = { ...whereCondition, status: "CONNECTED", official: false };
  }

  if (whatsappId) {
    whereCondition = { ...whereCondition, id: whatsappId };
  }

  // if (queueId) {
  //   includeCondition.push({
  //     model: Queue,
  //     as: "queues",
  //     attributes: ["id", "name", "color", "greetingMessage"],
  //     where: { id: queueId },
  //     required: true
  //   });
  // }

  const defaultWhatsapp = await Whatsapp.findOne({
    where: whereCondition,
    include: includeCondition
  });

  if (!defaultWhatsapp) {
    throw new AppError("ERR_NO_CONNECTED_WHATS_FOUND");
  }

  return defaultWhatsapp;
};

export default GetDefaultWhatsApp;
