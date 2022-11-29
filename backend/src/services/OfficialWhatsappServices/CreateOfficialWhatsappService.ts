import OfficialWhatsapp from "../../database/models/OfficialWhatsapp";

interface Request {
  name: string;
  facebookAccessToken: string;
  companyId: string | number;
}

const CreateOfficialWhatsappService = async ({
  name,
  facebookAccessToken,
  companyId
}: Request): Promise<OfficialWhatsapp> => {
  const officialWhatsapp = await OfficialWhatsapp.create({
    name,
    facebookAccessToken,
    companyId
  });

  return officialWhatsapp;
};

export default CreateOfficialWhatsappService;
