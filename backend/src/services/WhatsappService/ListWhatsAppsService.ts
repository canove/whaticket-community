import Whatsapp from "../../models/Whatsapp";

const ListWhatsAppsService = async (): Promise<Whatsapp[]> => {
  const whatsapps = await Whatsapp.findAll();

  return whatsapps;
};

export default ListWhatsAppsService;
