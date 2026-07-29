import { Request, Response } from "express";
import { handleWameWebhook } from "../services/WameServices/HandleWameWebhook";
import {
  handleMessage,
  handleMessageAck
} from "../handlers/handleWhatsappEvents";
import { wameConnectionUpdate, wameQrUpdate, wameGetMedia } from "../providers/WhatsApp/Implementations/wame";
import { logger } from "../utils/logger";

export const receive = async (req: Request, res: Response): Promise<Response> => {
  // responde rápido pra não gerar retry storm
  res.status(200).json({ received: true });

  try {
    const whatsappId = Number(req.params.whatsappId);
    const token = (req.query.token as string) || req.header("x-wame-token") || "";
    if (!token || token !== process.env.WAME_WEBHOOK_SECRET) {
      logger.warn(`wame webhook: invalid token for whatsapp ${whatsappId}`);
      return res;
    }

    const body = req.body || {};
    const event = { type: body.type, data: body.data };

    await handleWameWebhook(whatsappId, event, {
      onMessage: (msg, contact, context, media) =>
        handleMessage(msg, contact, context, media),
      onAck: (messageId, ack) => handleMessageAck(messageId, ack as any),
      onConnection: (status, data) => wameConnectionUpdate(whatsappId, status, data),
      onQrcode: code => wameQrUpdate(whatsappId, code),
      getMedia: messageId => wameGetMedia(whatsappId, messageId)
    });
  } catch (err) {
    logger.error(`wame webhook error: ${err}`);
  }
  return res;
};
