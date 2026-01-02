import { initWbot } from "../../libs/wbot.js";
import Whatsapp from "../../models/Whatsapp.js";
import { wbotMessageListener } from "./wbotMessageListener.js";
import { getIO } from "../../libs/socket.js";
import wbotMonitor from "./wbotMonitor.js";
import { logger } from "../../utils/logger.js";

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp
): Promise<void> => {
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.emit("whatsappSession", {
    action: "update",
    session: whatsapp
  });

  try {
    const wbot = await initWbot(whatsapp);
    wbotMessageListener(wbot);
    wbotMonitor(wbot, whatsapp);
  } catch (err) {
    logger.error(err);
  }
};
