import { initWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import wbotMessageListener from "./wbotMessageListener";
import wbotMonitor from "./wbotMonitor";

export const StartWhatsAppSessions = async (): Promise<void> => {
  const whatsapps = await Whatsapp.findAll();
  if (whatsapps.length > 0) {
    whatsapps.forEach(whatsapp => {
      initWbot(whatsapp)
        .then(() => {
          wbotMessageListener(whatsapp);
          wbotMonitor(whatsapp);
        })
        .catch(err => console.log(err));
    });
  }
};
