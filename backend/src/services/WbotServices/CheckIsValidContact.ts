import AppError from "../../errors/AppError.js";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp.js";
import { whatsappProvider } from "../../providers/WhatsApp/index.js";

const CheckIsValidContact = async (number: string): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  try {
    const isValidNumber = await whatsappProvider.checkNumber(
      defaultWhatsapp.id,
      number
    );
    if (!isValidNumber) {
      throw new AppError("invalidNumber");
    }
  } catch (err) {
    if (err.message === "invalidNumber") {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }
    throw new AppError("ERR_WAPP_CHECK_CONTACT");
  }
};

export default CheckIsValidContact;
