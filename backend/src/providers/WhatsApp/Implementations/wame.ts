import { WhatsApp, TypeMessage, StatusPresence } from "@raphaelvserafim/client-api-whatsapp";
import Whatsapp from "../../../models/Whatsapp";
import { getIO } from "../../../libs/socket";
import { logger } from "../../../utils/logger";
import {
  SendMessageOptions,
  SendMediaOptions,
  ProviderMessage,
  ProviderMediaInput,
  ProviderContact
} from "../types";
import { WhatsappProvider } from "../whatsappProvider";

const sessions = new Map<number, WhatsApp>();

const getClient = (sessionId: number): WhatsApp => {
  const client = sessions.get(sessionId);
  if (!client) throw new Error(`wame provider: no session for ${sessionId}`);
  return client;
};

/** Helper for tests only — injects a fake WhatsApp session. */
export function __setSessionForTest(sessionId: number): void {
  sessions.set(sessionId, new WhatsApp({ server: "http://test", key: "test" }));
}

const toProviderMessage = (
  to: string,
  body: string,
  res: any,
  isMedia: boolean
): ProviderMessage => ({
  id: res?.data?.key?.id || res?.messageId || res?.id || "",
  body,
  fromMe: true,
  hasMedia: isMedia,
  type: isMedia ? "chat" : "chat",
  timestamp: Math.floor(Date.now() / 1000),
  from: "",
  to,
  ack: 1
});

export async function wameConnectionUpdate(
  whatsappId: number,
  status: string,
  _data: any
): Promise<void> {
  const whatsapp = await Whatsapp.findByPk(whatsappId);
  if (!whatsapp) return;
  const connected = status === "open";
  await whatsapp.update({
    status: connected ? "CONNECTED" : "DISCONNECTED",
    qrcode: connected ? "" : whatsapp.qrcode,
    retries: 0
  });
  getIO().emit("whatsappSession", { action: "update", session: whatsapp });
}

export async function wameQrUpdate(whatsappId: number, code: string): Promise<void> {
  const whatsapp = await Whatsapp.findByPk(whatsappId);
  if (!whatsapp) return;
  await whatsapp.update({ qrcode: code, status: "qrcode", retries: 0 });
  getIO().emit("whatsappSession", { action: "update", session: whatsapp });
}

export async function wameGetMedia(
  whatsappId: number,
  messageId: string
): Promise<{ base64: string; mimetype: string } | null> {
  try {
    const client = getClient(whatsappId);
    const res: any = await client.message.getMedia(messageId, "base64");
    if (!res) return null;
    // O SDK pode retornar string base64 ou objeto { base64/data, mimetype }.
    const base64 = typeof res === "string" ? res : res.base64 || res.data || "";
    const mimetype = typeof res === "string" ? "application/octet-stream" : res.mimetype || "application/octet-stream";
    return base64 ? { base64, mimetype } : null;
  } catch (err) {
    logger.error(`wame getMedia error: ${err}`);
    return null;
  }
}

export interface WameInstanceInfo {
  official: boolean;
  connected: boolean;
  number: string;
  name: string;
  profilePicUrl: string;
}

// Webhook config accepted by wa.instance.updateWebhook (incl. webhookFormat,
// which the SDK's own param type may not expose yet).
interface WameWebhookConfig {
  allowWebhook: boolean;
  allowNumber: string;
  webhookFormat: string;
  webhookMessage: string;
  webhookMessageFromMe: string;
  webhookConnection: string;
  webhookQrCode: string;
  webhookGroup: string;
  webhookHistory: string;
}

// The SDK's typed `Instance` omits fields the API returns at runtime (official
// flag, meta.phone, connected). Describe just the ones we read — no `any`.
interface RawWameInstance {
  official?: boolean;
  connected?: boolean;
  phoneConnected?: boolean;
  user?: { id?: string; name?: string; imageProfile?: string };
  meta?: {
    phone?: { displayPhoneNumber?: string };
    profile?: { profilePictureUrl?: string };
  };
}

// On-demand: builds a client from the stored server+key and pulls live instance
// info (official flag, number, profile picture). Nothing is persisted — the key
// is the source of truth.
export async function wameGetInfo(
  whatsappId: number
): Promise<WameInstanceInfo | null> {
  const whatsapp = await Whatsapp.findByPk(whatsappId);
  if (!whatsapp?.server || !whatsapp?.key) return null;

  const client = new WhatsApp({ server: whatsapp.server, key: whatsapp.key });
  try {
    const res = await client.instance.info();
    const inst = (res?.instance ?? {}) as unknown as RawWameInstance;
    return {
      official: Boolean(inst.official),
      connected: Boolean(inst.connected ?? inst.phoneConnected),
      number: inst.meta?.phone?.displayPhoneNumber || inst.user?.id || "",
      name: inst.user?.name || "",
      profilePicUrl:
        inst.user?.imageProfile || inst.meta?.profile?.profilePictureUrl || ""
    };
  } catch (err) {
    logger.error(`wame instance.info error: ${err}`);
    return null;
  }
}

const notImplemented = (name: string) => {
  throw new Error(`wame provider: ${name} not implemented yet`);
};

export const WameProvider: WhatsappProvider = {
  async init(whatsapp: Whatsapp): Promise<void> {
    if (!whatsapp.server || !whatsapp.key) {
      throw new Error("wame provider: whatsapp.server e whatsapp.key são obrigatórios");
    }
    const client = new WhatsApp({ server: whatsapp.server, key: whatsapp.key });
    sessions.set(whatsapp.id, client);

    const backendUrl = process.env.BACKEND_URL || "";
    const secret = process.env.WAME_WEBHOOK_SECRET || "";
    const base = `${backendUrl}/wame/webhook/${whatsapp.id}?token=${encodeURIComponent(secret)}`;

    // Register webhooks (non-fatal — the connection can still work if this fails).
    try {
      const webhookConfig: WameWebhookConfig = {
        allowWebhook: true,
        allowNumber: "all",
        // Official focus: Meta / WhatsApp Cloud API envelope for messages &
        // statuses. (Connection/QR events still arrive in the native shape —
        // the webhook handler detects both.)
        webhookFormat: "meta",
        webhookMessage: base,
        webhookMessageFromMe: base,
        webhookConnection: base,
        webhookQrCode: base,
        webhookGroup: "",
        webhookHistory: ""
      };
      await client.instance.updateWebhook(webhookConfig);
    } catch (err) {
      logger.error(`wame updateWebhook error: ${err}`);
    }

    // Trigger a connection — non-fatal, since an official account is often
    // already connected on Meta's side and connect() may throw or be a no-op.
    try {
      await client.instance.connect();
    } catch (err) {
      logger.error(`wame connect error: ${err}`);
    }

    // Determine the REAL status from instance.info(), regardless of the calls
    // above. Official accounts never emit a "connection open" webhook, so this
    // is what keeps the connection from sitting DISCONNECTED while online.
    try {
      const res = await client.instance.info();
      const inst = (res?.instance ?? {}) as unknown as RawWameInstance;
      const connected = Boolean(inst.connected ?? inst.phoneConnected);
      await whatsapp.update({
        status: connected ? "CONNECTED" : "DISCONNECTED",
        qrcode: connected ? "" : whatsapp.qrcode,
        retries: 0
      });
      getIO().emit("whatsappSession", { action: "update", session: whatsapp });
    } catch (err) {
      logger.error(`wame init info error: ${err}`);
      await whatsapp.update({ status: "DISCONNECTED" });
    }
  },
  removeSession(whatsappId: number): void {
    sessions.delete(whatsappId);
  },
  async logout(sessionId: number): Promise<void> {
    try {
      const client = sessions.get(sessionId);
      if (client) await client.instance.logout();
    } finally {
      sessions.delete(sessionId);
    }
  },
  async sendMessage(
    sessionId: number,
    to: string,
    body: string,
    _options?: SendMessageOptions
  ): Promise<ProviderMessage> {
    const client = getClient(sessionId);
    const res = await client.message.send({ type: TypeMessage.TEXT, body: { to, text: body } });
    return toProviderMessage(to, body, res, false);
  },

  async sendMedia(
    sessionId: number,
    to: string,
    media: ProviderMediaInput,
    options?: SendMediaOptions
  ): Promise<ProviderMessage> {
    const client = getClient(sessionId);
    const base64 = (media.data as Buffer)?.toString("base64") ?? "";
    const caption = options?.caption ?? "";
    const [kind] = (media.mimetype ?? "").split("/");

    let res: any;
    if (kind === "image") {
      // sendImageBase64(to: string, base64: string, caption?: string)
      res = await client.message.sendImageBase64(to, base64, caption || undefined);
    } else if (kind === "audio") {
      // sendAudioBase64(to: string, base64: string)
      res = await client.message.sendAudioBase64(to, base64);
    } else {
      // video has no base64 method in SDK — falls back to document
      // sendDocumentBase64(to: string, base64: string, mimetype: string, fileName?: string, caption?: string)
      res = await client.message.sendDocumentBase64(
        to,
        base64,
        media.mimetype,
        media.filename || undefined,
        caption || undefined
      );
    }

    return toProviderMessage(to, caption || media.filename, res, true);
  },
  async deleteMessage(_sessionId: number, _chatId: string, messageId: string, _fromMe: boolean): Promise<void> {
    // The wame SDK has no per-message delete/revoke method (only chat.delete, which
    // wipes the ENTIRE chat — never acceptable here). Best-effort no-op so callers
    // degrade gracefully instead of destroying a conversation.
    logger.warn(
      `wame provider: deleteMessage not supported by SDK (message ${messageId} left in place)`
    );
  },
  async checkNumber(sessionId: number, number: string): Promise<string> {
    // Real SDK: wa.action.checkRegistered(number) → { status, registered }
    const client = getClient(sessionId);
    const digits = number.replace(/\D/g, "");
    const res = await client.action.checkRegistered(digits);
    if (!res.registered) throw new Error("wame: number not registered");
    return digits;
  },
  async getProfilePicUrl(sessionId: number, number: string): Promise<string> {
    // Real SDK: wa.contact.profile(id) → { status, data: ContactInfo }; ContactInfo.imgUrl
    try {
      const client = getClient(sessionId);
      const digits = number.replace(/\D/g, "");
      const res = await client.contact.profile(digits);
      return res?.data?.imgUrl || "";
    } catch {
      return "";
    }
  },
  async getContacts(_sessionId: number): Promise<ProviderContact[]> {
    // Best-effort MVP: not implemented — return empty list
    return [];
  },
  async sendSeen(sessionId: number, chatId: string): Promise<void> {
    // Real SDK: wa.message.send({ type: TypeMessage.PRESENCE, body: { to, status: StatusPresence.AVAILABLE } })
    try {
      const client = getClient(sessionId);
      const to = chatId.replace(/\D/g, "");
      await client.message.send({
        type: TypeMessage.PRESENCE,
        body: { to, status: StatusPresence.AVAILABLE }
      });
    } catch {
      /* best-effort */
    }
  },
  async fetchChatMessages(): Promise<ProviderMessage[]> {
    // Best-effort MVP: not implemented — return empty list
    return [];
  }
};
