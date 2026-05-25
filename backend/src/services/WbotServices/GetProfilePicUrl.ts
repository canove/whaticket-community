import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp.js";
import { whatsappProvider } from "../../providers/WhatsApp/index.js";

const GetProfilePicUrl = async (number: string): Promise<string> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const profilePicUrl = await whatsappProvider.getProfilePicUrl(
    defaultWhatsapp.id,
    number
  );

  return profilePicUrl;
};

export default GetProfilePicUrl;
