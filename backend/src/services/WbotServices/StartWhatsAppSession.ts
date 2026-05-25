import Whatsapp from "../../models/Whatsapp.js";
import { getProvider } from "../../providers/WhatsApp/index.js";
import { getIO } from "../../libs/socket.js";
import { logger } from "../../utils/logger.js";

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp
): Promise<void> => {
  const channel = whatsapp.channel || "whatsapp";

  // Instagram without a stored session waits for user login — handled by InstagramProvider.init()
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.to("notification").emit("whatsappSession", {
    action: "update",
    session: whatsapp
  });

  try {
    await getProvider(channel).init(whatsapp);
  } catch (err) {
    logger.error(err);
  }
};
