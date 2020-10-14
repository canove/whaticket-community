import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";

const GetDefaultWhatsApp = async (): Promise<Whatsapp> => {
  const defaultWhatsapp = await Whatsapp.findOne({
    where: { isDefault: true }
  });

  if (!defaultWhatsapp) {
    throw new AppError("ERR_NO_DEF_WAPP_FOUND");
  }

  return defaultWhatsapp;
};

export default GetDefaultWhatsApp;
