/*eslint-disable*/
import Whatsapp from "../../database/models/Whatsapp";
import axios from "axios";
//import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
//import wbotMonitor from "./wbotMonitor";
import { logger } from "../../utils/logger";

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp
): Promise<void> => {
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.emit(`whatsappSession${whatsapp.companyId}`, {
    action: "update",
    session: whatsapp
  });

  try {
    const apiUrl = `${process.env.WPP_NOF_URL}/start`;
    const payload = {
      session: whatsapp.name,
      companyId: whatsapp.companyId,
      wh_status: process.env.WPP_NOF_WEBHOOK_URL,
      wh_message: process.env.WPP_NOF_WEBHOOK_URL,
      wh_qrcode: process.env.WPP_NOF_WEBHOOK_URL,
      wh_connect: process.env.WPP_NOF_WEBHOOK_URL
    };

    axios.post(apiUrl, JSON.stringify(payload), { headers: {
      "x-api-key": process.env.WPP_NOF_API_KEY
    }});
  } catch (err) {
    logger.error(err);
  }

  /*try {
    const wbot = await initWbot(whatsapp);
    wbotMessageListener(wbot);
    wbotMonitor(wbot, whatsapp);
  } catch (err) {
    logger.error(err);
  }*/
};
