import { Request, Response } from "express";
import axios from "axios";
import { handleMessage } from "../handlers/handleWhatsappEvents.js";
import { logger } from "../utils/logger.js";
import instagramConfig from "../config/instagram.js";
import {
  MetaWebhookPayload,
  MetaMessagingEvent,
  MetaAttachment,
  fromIgsid,
  graphGet,
  GRAPH_TIMEOUT_MS
} from "../helpers/instagram.js";
import {
  instagramSessionRegistry,
  resolveWhatsappIdByInstagramAccount
} from "../helpers/instagramSessionRegistry.js";
import { verifyMetaSignature } from "../helpers/metaWebhookSignature.js";
import type {
  ContactPayload,
  MediaPayload
} from "../handlers/handleWhatsappEvents.js";
import type { ProviderMessage } from "../providers/WhatsApp/types/index.js";

// ─── Attachment type map (module-scope constant) ──────────────────────────────

const ATTACHMENT_TYPE_MAP: Record<string, ProviderMessage["type"]> = {
  image: "image",
  video: "video",
  audio: "audio"
};

const mapAttachmentType = (type: string): ProviderMessage["type"] =>
  ATTACHMENT_TYPE_MAP[type] ?? "document";

// ─── GET /instagram/webhook — Meta verification ──────────────────────────────

const verify = (req: Request, res: Response): void => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === instagramConfig.webhookVerifyToken) {
    logger.info({ info: "Instagram: webhook verified" });
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};

// ─── POST /instagram/webhook — Incoming messages ─────────────────────────────

const receive = (req: Request, res: Response): void => {
  logger.info({ info: "Instagram: webhook POST received" });

  if (!verifySignature(req)) {
    logger.warn({ info: "Instagram: webhook signature verification failed" });
    res.sendStatus(403);
    return;
  }

  // Respond immediately — Meta requires < 20s
  res.sendStatus(200);

  processWebhookPayload(req.body as MetaWebhookPayload).catch(err => {
    logger.error({ info: "Instagram: webhook processing error", err });
  });
};

// ─── Signature verification ──────────────────────────────────────────────────

const verifySignature = (req: Request): boolean =>
  verifyMetaSignature(req, instagramConfig.appSecret);

// ─── Attachment helpers ───────────────────────────────────────────────────────

const downloadMediaAttachment = async (
  attachment: MetaAttachment,
  messageId: string
): Promise<MediaPayload | undefined> => {
  const url = attachment.payload?.url;
  if (!url) return undefined;

  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: GRAPH_TIMEOUT_MS
    });
    const contentType = String(res.headers["content-type"] || "image/jpeg");
    const ext = contentType.split("/")[1]?.split(";")[0] || "jpg";
    return {
      filename: `instagram_${messageId}.${ext}`,
      mimetype: contentType,
      data: Buffer.from(res.data).toString("base64")
    };
  } catch (err) {
    logger.warn({ info: "Instagram: media download failed", err });
    return undefined;
  }
};

const fetchContactProfile = async (
  igsid: string,
  accessToken: string
): Promise<{ name: string; profilePicUrl?: string }> => {
  const fallback = { name: fromIgsid(igsid) };
  try {
    const data = await graphGet<{ name?: string; profile_pic?: string }>(
      `/${igsid}`,
      accessToken,
      { fields: "name,username,profile_pic" }
    );
    return {
      name: data.name || fallback.name,
      profilePicUrl: data.profile_pic
    };
  } catch {
    return fallback;
  }
};

const buildProviderMessage = (
  event: MetaMessagingEvent,
  loggedIgsid: string
): ProviderMessage => {
  const msg = event.message!;
  const attachment = msg.attachments?.[0];
  const hasMedia = !!attachment;

  return {
    id: msg.mid,
    body: msg.text || "",
    fromMe: event.sender.id === loggedIgsid,
    hasMedia,
    type: hasMedia ? mapAttachmentType(attachment!.type) : "chat",
    timestamp: Math.floor(event.timestamp / 1000),
    from: fromIgsid(event.sender.id),
    to: fromIgsid(event.recipient.id),
    ack: event.sender.id === loggedIgsid ? 2 : 0
  };
};

// ─── Webhook payload processing ───────────────────────────────────────────────

const processMessagingEvent = async (
  event: MetaMessagingEvent,
  whatsappId: number,
  session: { instagramAccountId: string; accessToken: string }
): Promise<void> => {
  if (!event.message || event.message.is_echo) return;

  const providerMsg = buildProviderMessage(event, session.instagramAccountId);
  const igsidToFetch = providerMsg.fromMe
    ? event.recipient.id
    : event.sender.id;
  const { name, profilePicUrl } = await fetchContactProfile(
    igsidToFetch,
    session.accessToken
  );

  const contactPayload: ContactPayload = {
    name,
    number: fromIgsid(igsidToFetch),
    profilePicUrl,
    isGroup: false
  };

  const attachment = event.message.attachments?.[0];
  const mediaPayload = attachment
    ? await downloadMediaAttachment(attachment, event.message.mid)
    : undefined;

  await handleMessage(
    providerMsg,
    contactPayload,
    {
      whatsappId,
      unreadMessages: providerMsg.fromMe ? 0 : 1,
      channel: "instagram"
    },
    mediaPayload
  );
};

const processWebhookPayload = async (
  payload: MetaWebhookPayload
): Promise<void> => {
  if (payload.object !== "instagram") return;

  for (const entry of payload.entry) {
    const whatsappId = await resolveWhatsappIdByInstagramAccount(entry.id);
    if (!whatsappId) {
      logger.warn({
        info: "Instagram webhook: no connection for instagram account",
        instagramAccountId: entry.id
      });
      continue;
    }

    const session = instagramSessionRegistry.getByWhatsappId(whatsappId);
    if (!session) continue;

    await Promise.all(
      entry.messaging.map(event =>
        processMessagingEvent(event, whatsappId, session).catch(err => {
          logger.error({
            info: "Instagram: error processing webhook event",
            err
          });
        })
      )
    );
  }
};

export default { verify, receive };
