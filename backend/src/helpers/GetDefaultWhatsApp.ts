import AppError from "../errors/AppError";
import Whatsapp from "../database/models/Whatsapp";
import Queue from "../database/models/Queue";
import FileRegister from "../database/models/FileRegister";
import { Op } from "sequelize";
import { endOfDay, startOfDay } from "date-fns";

interface Request {
  companyId: number;
  whatsappId?: string;
  official?: boolean;
  queueId?: string | number;
}

const GetDefaultWhatsApp = async ({ companyId, whatsappId, official, queueId }: Request): Promise<Whatsapp> => {
  let whereCondition = null;
  let order = null;

  whereCondition = { companyId, deleted: false };

  if (!official) {
    whereCondition = { ...whereCondition, status: "CONNECTED", official: false };
    order = [["lastSendDate", "ASC"]];
  }

  if (whatsappId) {
    whereCondition = { ...whereCondition, id: whatsappId };
  }

  const defaultWhatsapp = await Whatsapp.findOne({
    where: whereCondition,
    order: order,
  });

  if (!defaultWhatsapp) {
    throw new AppError("ERR_NO_CONNECTED_WHATS_FOUND");
  }

  if (!official) {
    if (whatsappId) {
      const canUseWhats = await checkAutomaticControl(defaultWhatsapp, companyId);

      if (!canUseWhats) throw new AppError("ERR_MAX_AUTOMATIC_CONTROL");
    }

    let lastSendDate = new Date();

    await defaultWhatsapp.update({ lastSendDate });
  }

  return defaultWhatsapp;
};

const checkAutomaticControl = async (whatsapp, companyId) => {
  if (whatsapp.automaticControl && whatsapp.currentTriggerQuantity) {
    const now = new Date();

    const regCount = await FileRegister.count({
      where: {
        whatsappId: whatsapp.id,
        companyId,
        processedAt: { [Op.between]: [+startOfDay(now), +endOfDay(now)] }
      }
    });

    if (regCount >= whatsapp.currentTriggerQuantity) return false;
  }

  return true;
}

export default GetDefaultWhatsApp;
