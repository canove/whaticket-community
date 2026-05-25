import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService.js";
import { StartWhatsAppSession } from "./StartWhatsAppSession.js";

export const StartAllWhatsAppsSessions = async (): Promise<void> => {
  const whatsapps = await ListWhatsAppsService();
  for (const whatsapp of whatsapps) {
    await StartWhatsAppSession(whatsapp);
    // Stagger session startups to avoid thundering herd on DB and WhatsApp servers
    if (whatsapps.length > 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
};
