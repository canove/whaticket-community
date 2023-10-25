import { getWbot } from "../libs/wbot";
import Whatsapp from "../models/Whatsapp";

const GetWhatsappWbot = async (whatsapp: Whatsapp) => {
  const wbot = await getWbot(whatsapp.id);
  return wbot;
};

export default GetWhatsappWbot;
