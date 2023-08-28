import Whatsapp from "../../models/Whatsapp";

const AssociateWhatsappCompany = async (
  whatsapp: Whatsapp,
  userCompanyIds: number[]
): Promise<void> => {
  await whatsapp.$set("companies", userCompanyIds);

  await whatsapp.reload();
};

export default AssociateWhatsappCompany;
