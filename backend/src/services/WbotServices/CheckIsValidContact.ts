import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const CheckIsValidContact = async (number: string): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = getWbot(defaultWhatsapp.id);

  try {
    const isValidNumber = await wbot.isRegisteredUser(`${number}@c.us`);
    if (!isValidNumber) {
      throw new AppError("invalidNumber");
    }
  } catch (err) {
    console.log(err);
    if (err.message === "invalidNumber") {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }
    throw new AppError("ERR_WAPP_CHECK_CONTACT");
  }
};

export default CheckIsValidContact;
