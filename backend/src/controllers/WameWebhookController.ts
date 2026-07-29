import { Request, Response } from "express";
import { handleWameWebhook } from "../services/WameServices/HandleWameWebhook";
import {
  handleMessage,
  handleMessageAck
} from "../handlers/handleWhatsappEvents";
import { wameConnectionUpdate, wameQrUpdate, wameGetMedia } from "../providers/WhatsApp/Implementations/wame";
import { MessageAck } from "../providers/WhatsApp/types";
import { logger } from "../utils/logger";

export const receive = async (req: Request, res: Response): Promise<Response> => {
  // responde rápido pra não gerar retry storm
  res.status(200).json({ received: true });

  try {
    const whatsappId = Number(req.params.whatsappId);
    const body = req.body || {};

    // Arrival log — confirms the webhook actually reached us (whaticket does not
    // log HTTP requests by default) and shows the raw payload for debugging.
    logger.info(
      `wame webhook hit: wa=${whatsappId} kind=${
        body?.object ? "meta" : body?.type || "unknown"
      } body=${JSON.stringify(body).slice(0, 1000)}`
    );

    const token = (req.query.token as string) || req.header("x-wame-token") || "";
    if (!token || token !== process.env.WAME_WEBHOOK_SECRET) {
      logger.warn(`wame webhook: invalid token for whatsapp ${whatsappId}`);
      return res;
    }

    await handleWameWebhook(whatsappId, body, {
      onMessage: (msg, contact, context, media) =>
        handleMessage(msg, contact, context, media),
      onAck: (messageId, ack) => handleMessageAck(messageId, ack as MessageAck),
      onConnection: (status, data) => wameConnectionUpdate(whatsappId, status, data),
      onQrcode: code => wameQrUpdate(whatsappId, code),
      getMedia: messageId => wameGetMedia(whatsappId, messageId)
    });
  } catch (err) {
    logger.error(`wame webhook error: ${err}`);
  }
  return res;
};
