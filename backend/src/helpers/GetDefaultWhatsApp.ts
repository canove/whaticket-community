import AppError from "../errors/AppError";
import Whatsapp from "../database/models/Whatsapp";

const GetDefaultWhatsApp = async (companyId: number): Promise<Whatsapp> => {
  const defaultWhatsapp = await Whatsapp.findOne({
    where: {
      companyId,
      status: "CONNECTED",
      official: false,
      deleted: false,
    }
  });

  if (!defaultWhatsapp) {
    throw new AppError("ERR_NO_CONNECTED_WHATS_FOUND");
  }

  return defaultWhatsapp;
};

export default GetDefaultWhatsApp;
