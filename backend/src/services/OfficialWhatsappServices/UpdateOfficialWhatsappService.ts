import OfficialWhatsapp from "../../database/models/OfficialWhatsapp";
import ShowOfficialWhatsappService from "./ShowOfficialWhatsappService";

interface Request {
  name: string;
  officialWhatsappId: number | string;
  companyId: number | string;
}

const UpdateOfficialWhatsappService = async ({
  name,
  officialWhatsappId,
  companyId
}: Request): Promise<OfficialWhatsapp> => {
  const officialWhatsapp = await ShowOfficialWhatsappService(officialWhatsappId, companyId);

  await officialWhatsapp.update({
    name
  });

  officialWhatsapp.reload();

  return officialWhatsapp;
};

export default UpdateOfficialWhatsappService;
