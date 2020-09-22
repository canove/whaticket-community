import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const CheckIsValidContact = async (number: string): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = getWbot(defaultWhatsapp.id);

  try {
    const isValidNumber = await wbot.isRegisteredUser(`${number}@c.us`);
    if (!isValidNumber) {
      throw new AppError("The suplied number is not a valid Whatsapp number");
    }
  } catch (err) {
    console.log(err);
    throw new AppError(
      "Could not valid WhatsApp contact. Check connections page"
    );
  }
};

export default CheckIsValidContact;
