import { Request, Response } from "express";
import { handleMessage } from "../handlers/handleWhatsappEvents.js";
import { logger } from "../utils/logger.js";
import whatsappCloudConfig from "../config/whatsappCloud.js";
import {
  WACWebhookPayload,
  WACMessage,
  verifyWACSignature,
  downloadWACMedia
} from "../helpers/whatsappCloud.js";
import {
  whatsappCloudSessionRegistry,
  resolveWhatsappIdByPhoneNumberId
} from "../helpers/whatsappCloudSessionRegistry.js";
import type {
  ContactPayload,
  MediaPayload
} from "../handlers/handleWhatsappEvents.js";
import type { ProviderMessage } from "../providers/WhatsApp/types/index.js";

// ─── Type map ────────────────────────────────────────────────────────────────

const WAC_TYPE_MAP: Record<string, ProviderMessage["type"]> = {
  text: "chat",
  image: "image",
  video: "video",
  audio: "audio",
  voice: "audio",
  document: "document",
  sticker: "image",
  location: "chat",
  reaction: "chat"
};

// ─── GET /whatsapp-cloud/webhook — Meta verification ─────────────────────────

const verify = (req: Request, res: Response): void => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === whatsappCloudConfig.webhookVerifyToken) {
    logger.info({ info: "WhatsApp Cloud: webhook verified" });
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};

// ─── POST /whatsapp-cloud/webhook — Incoming messages ────────────────────────

const receive = (req: Request, res: Response): void => {
  if (!verifyWACSignature(req)) {
    logger.warn({ info: "WhatsApp Cloud: webhook signature verification failed" });
    res.sendStatus(403);
    return;
  }

  res.sendStatus(200);

  processWebhookPayload(req.body as WACWebhookPayload).catch(err => {
    logger.error({ info: "WhatsApp Cloud: webhook processing error", err });
  });
};

// ─── Processing ───────────────────────────────────────────────────────────────

const buildProviderMessage = (
  msg: WACMessage,
  phoneNumberId: string,
  contactName: string
): ProviderMessage => {
  const hasMedia = ["image", "video", "audio", "voice", "document", "sticker"].includes(msg.type);
  return {
    id: msg.id,
    body: msg.text?.body || (hasMedia ? "" : contactName),
    fromMe: false,
    hasMedia,
    type: WAC_TYPE_MAP[msg.type] ?? "chat",
    timestamp: Number(msg.timestamp),
    from: msg.from,
    to: phoneNumberId,
    ack: 0
  };
};

const processMessage = async (
  msg: WACMessage,
  contactName: string,
  phoneNumberId: string,
  whatsappId: number,
  token: string
): Promise<void> => {
  const providerMsg = buildProviderMessage(msg, phoneNumberId, contactName);

  const contactPayload: ContactPayload = {
    name: contactName,
    number: msg.from,
    isGroup: false
  };

  let mediaPayload: MediaPayload | undefined;

  if (providerMsg.hasMedia) {
    const mediaField = msg.image || msg.video || msg.audio || msg.document || msg.sticker;
    if (mediaField) {
      const downloaded = await downloadWACMedia(mediaField.id, token);
      if (downloaded) {
        const ext = downloaded.contentType.split("/")[1]?.split(";")[0] || "bin";
        mediaPayload = {
          filename: (msg.document as any)?.filename || `wac_${msg.id}.${ext}`,
          mimetype: downloaded.contentType,
          data: downloaded.data.toString("base64")
        };
      }
    }
  }

  await handleMessage(
    providerMsg,
    contactPayload,
    { whatsappId, unreadMessages: 1, channel: "whatsapp_cloud" },
    mediaPayload
  );
};

const processWebhookPayload = async (
  payload: WACWebhookPayload
): Promise<void> => {
  if (payload.object !== "whatsapp_business_account") return;

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== "messages") continue;

      const { metadata, messages, contacts } = change.value;
      if (!messages?.length) continue;

      const { phone_number_id } = metadata;
      const whatsappId = await resolveWhatsappIdByPhoneNumberId(phone_number_id);

      if (!whatsappId) {
        logger.warn({
          info: "WhatsApp Cloud: no connection for phone_number_id",
          phone_number_id
        });
        continue;
      }

      const session = whatsappCloudSessionRegistry.getByWhatsappId(whatsappId);
      if (!session) continue;

      const contactMap = new Map(
        (contacts || []).map(c => [c.wa_id, c.profile.name])
      );

      await Promise.all(
        messages.map(msg => {
          const contactName = contactMap.get(msg.from) || msg.from;
          return processMessage(
            msg,
            contactName,
            phone_number_id,
            whatsappId,
            session.accessToken
          ).catch(err => {
            logger.error({ info: "WhatsApp Cloud: error processing message", err });
          });
        })
      );
    }
  }
};

export default { verify, receive };
