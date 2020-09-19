import Whatsapp from "../../models/Whatsapp";

interface Response {
  whatsapps: Whatsapp[];
}

const ListWhatsAppsService = async (): Promise<Response> => {
  const whatsapps = await Whatsapp.findAll();

  return { whatsapps };
};

export default ListWhatsAppsService;
