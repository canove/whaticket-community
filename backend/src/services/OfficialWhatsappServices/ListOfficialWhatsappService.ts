import OfficialWhatsapp from "../../database/models/OfficialWhatsapp";

const ListOfficialWhatsappService = async (companyId: number): Promise<OfficialWhatsapp[]> => {
  const officialWhatsapps = await OfficialWhatsapp.findAll({
    where: { companyId }
  });

  return officialWhatsapps;
};

export default ListOfficialWhatsappService;
