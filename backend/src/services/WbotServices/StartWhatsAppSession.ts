import { initWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import wbotMessageListener from "./wbotMessageListener";
import wbotMonitor from "./wbotMonitor";

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp
): Promise<void> => {
  try {
    const wbot = await initWbot(whatsapp);
    wbotMessageListener(wbot);
    wbotMonitor(wbot, whatsapp);
  } catch (err) {
    console.log(err);
  }
};
