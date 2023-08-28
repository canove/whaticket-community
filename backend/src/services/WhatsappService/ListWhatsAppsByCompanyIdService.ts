import Company from "../../models/Company";
import Whatsapp from "../../models/Whatsapp";

const ListWhatsAppsByCompanyIdService = async (companyId: string): Promise<Whatsapp[]> => {
  const whatsapps = await Whatsapp.findAll({
    include: [
      {
        model: Company,
        as: "companies",
        where:{
          id: companyId
        },
        attributes: ["id"]
      }
    ]
  });
  return whatsapps;
};

export default ListWhatsAppsByCompanyIdService;
