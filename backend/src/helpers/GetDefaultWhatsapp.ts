import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";
import FindWhatsAppService from "../services/WhatsappService/FindWhatsAppService";

const GetDefaultWhatsapp = async (): Promise<Whatsapp> => {
  const defaultWhatsapp = await FindWhatsAppService({
    where: { isDefault: true }
  });

  if (!defaultWhatsapp) {
    throw new AppError("No default WhatsApp found. Check Connection page.");
  }

  return defaultWhatsapp;
};

export default GetDefaultWhatsapp;
