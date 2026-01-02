import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp.js";
import { getWbot } from "../../libs/wbot.js";

const CheckContactNumber = async (number: string): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = getWbot(defaultWhatsapp.id);

  const validNumber: any = await wbot.getNumberId(`${number}@c.us`);
  return validNumber.user;
};

export default CheckContactNumber;
