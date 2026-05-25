import AppError from "../errors/AppError.js";
import Whatsapp from "../models/Whatsapp.js";
import GetDefaultWhatsAppByUser from "./GetDefaultWhatsAppByUser.js";

const GetDefaultWhatsApp = async (userId?: number): Promise<Whatsapp> => {
  if (userId) {
    const whatsappByUser = await GetDefaultWhatsAppByUser(userId);
    if (whatsappByUser !== null) {
      return whatsappByUser;
    }
  }

  const defaultWhatsapp = await Whatsapp.findOne({
    where: { isDefault: true }
  });

  if (!defaultWhatsapp) {
    throw new AppError("ERR_NO_DEF_WAPP_FOUND");
  }

  return defaultWhatsapp;
};

export default GetDefaultWhatsApp;
