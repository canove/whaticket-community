import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService.js";
import { StartWhatsAppSession } from "./StartWhatsAppSession.js";

export const StartAllWhatsAppsSessions = async (): Promise<void> => {
  const whatsapps = await ListWhatsAppsService();
  if (whatsapps.length > 0) {
    whatsapps.forEach(whatsapp => {
      StartWhatsAppSession(whatsapp);
    });
  }
};
