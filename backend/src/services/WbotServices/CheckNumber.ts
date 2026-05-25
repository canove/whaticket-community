import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp.js";
import { whatsappProvider } from "../../providers/WhatsApp/index.js";

const CheckContactNumber = async (number: string): Promise<string> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const validNumber = await whatsappProvider.checkNumber(
    defaultWhatsapp.id,
    number
  );
  return validNumber;
};

export default CheckContactNumber;
