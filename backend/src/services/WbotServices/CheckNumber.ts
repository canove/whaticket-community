import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

interface NumberIdResult {
  user: string;
}

const CheckContactNumber = async (number: string): Promise<string> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = getWbot(defaultWhatsapp.id);
  const validNumber = (await wbot.getNumberId(
    `${number}@c.us`
  )) as unknown as NumberIdResult | null;
  if (!validNumber) {
    throw new Error("ERR_WAPP_INVALID_CONTACT");
  }
  return validNumber.user;
};

export default CheckContactNumber;
