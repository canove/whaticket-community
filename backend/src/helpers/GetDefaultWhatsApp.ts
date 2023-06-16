import AppError from "../errors/AppError";
import Whatsapp from "../database/models/Whatsapp";
import Queue from "../database/models/Queue";
import FileRegister from "../database/models/FileRegister";
import { Op } from "sequelize";
import { endOfDay, startOfDay } from "date-fns";
import ListCompanySettingsService from "../services/SettingServices/ListCompanySettingsService";

interface Request {
  companyId: number;
  whatsappId?: string;
  official?: boolean;
  queueId?: string | number;
}

const GetDefaultWhatsApp = async ({ companyId, whatsappId, official, queueId }: Request): Promise<Whatsapp> => {
  const settings = await ListCompanySettingsService(companyId);

  let whereCondition = null;
  let order = null;

  whereCondition = { companyId, deleted: false };

  if (!official) {
    whereCondition = { 
      ...whereCondition, 
      status: "CONNECTED", 
      official: false, 
      [Op.or]: [{ sleeping: false }, { sleeping: null }],
    };
    order = [["lastSendDate", "ASC"]];

    if (settings.createTicketInterval) {
      whereCondition = { 
        ...whereCondition,
        currentTriggerQuantity: { [Op.gte]: 50 },
      }
    }

    if (settings.createTicketWhatsappType) {
      whereCondition = {
        ...whereCondition,
        type: settings.createTicketWhatsappType
      }
    }
  }

  if (whatsappId) {
    whereCondition = { ...whereCondition, id: whatsappId };
  }

  const whatsapp = await Whatsapp.findOne({
    where: whereCondition,
    order: order,
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_AVAILABLE_WHATS_FOUND");
  }

  if (!official) {
    if (whatsappId) {
      const canUseWhats = await checkAutomaticControl(whatsapp, companyId);

      if (!canUseWhats) throw new AppError("ERR_MAX_AUTOMATIC_CONTROL");
    }

    const now = new Date();
    
    if (whatsapp.lastSendDate && settings.createTicketInterval) {
      const lastSendDate = new Date(whatsapp.lastSendDate);

      if ((now.getTime() - lastSendDate.getTime()) < (settings.createTicketInterval * 60000)) {
        throw new AppError("ERR_WHATSAPP_CREATE_TIME");
      }
    }

    await whatsapp.update({ lastSendDate: now });
  }

  return whatsapp;
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
