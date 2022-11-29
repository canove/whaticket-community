import OfficialWhatsapp from "../../database/models/OfficialWhatsapp";
import AppError from "../../errors/AppError";

const ShowByNameOfficialWhatsappService = async (name: string | number, companyId: string | number): Promise<OfficialWhatsapp> => {
  const officialWhatsapp = await OfficialWhatsapp.findOne({
    where: { name, companyId }
  });

  if (!officialWhatsapp) {
    throw new AppError("ERR_NO_WHATSAPP_FOUND", 404);
  }

  return officialWhatsapp;
};

export default ShowByNameOfficialWhatsappService;
