import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const GetChatById = async (chatID: string): Promise<any> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = getWbot(defaultWhatsapp.id);

  try {
    return await wbot.getChatById(chatID);
  } catch (err) {
    if (err.message === "invalidNumber") {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }
    // throw new AppError("ERR_WAPP_CHECK_CONTACT");
    // console.log(err.message);
  }
};

export default GetChatById;
