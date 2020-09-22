import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const GetProfilePicUrl = async (number: string): Promise<string> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = getWbot(defaultWhatsapp.id);

  const profilePicUrl = await wbot.getProfilePicUrl(`${number}@c.us`);

  return profilePicUrl;
};

export default GetProfilePicUrl;
