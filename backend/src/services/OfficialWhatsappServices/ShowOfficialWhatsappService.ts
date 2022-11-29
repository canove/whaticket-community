import OfficialWhatsapp from "../../database/models/OfficialWhatsapp";
import AppError from "../../errors/AppError";

const ShowOfficialWhatsappService = async (id: string | number, companyId: string | number): Promise<OfficialWhatsapp> => {
  const officialWhatsapp = await OfficialWhatsapp.findOne({
    where: { id, companyId }
  });

  if (!officialWhatsapp) {
    throw new AppError("ERR_NO_WHATSAPP_FOUND", 404);
  }

  return officialWhatsapp;
};

export default ShowOfficialWhatsappService;
