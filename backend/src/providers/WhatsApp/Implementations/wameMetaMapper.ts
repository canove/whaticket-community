import { MessageType, MessageAck } from "../types";
import {
  MessagePayload,
  ContactPayload,
  WhatsappContextPayload
} from "../../../handlers/handleWhatsappEvents";

export interface MappedMetaMessage {
  message: MessagePayload;
  contact: ContactPayload;
  context: WhatsappContextPayload;
}

// Meta / WhatsApp Cloud API message status → whaticket MessageAck.
export function mapMetaAck(status: string | undefined): MessageAck {
  switch (status) {
    case "sent":
      return 1;
    case "delivered":
      return 2;
    case "read":
      return 3;
    case "played":
      return 4;
    default:
      return 0;
  }
}

function mapMetaContent(
  msg: any
): { body: string; type: MessageType; hasMedia: boolean } {
  switch (msg.type) {
    case "text":
      return { body: msg.text?.body || "", type: "chat", hasMedia: false };
    case "image":
      return { body: msg.image?.caption || "", type: "image", hasMedia: true };
    case "video":
      return { body: msg.video?.caption || "", type: "video", hasMedia: true };
    case "audio":
      return {
        body: "",
        type: msg.audio?.voice ? "ptt" : "audio",
        hasMedia: true
      };
    case "document":
      return {
        body: msg.document?.caption || msg.document?.filename || "",
        type: "document",
        hasMedia: true
      };
    case "sticker":
      return { body: "", type: "sticker", hasMedia: true };
    case "location":
      return {
        body: `${msg.location?.latitude ?? ""},${msg.location?.longitude ?? ""}`,
        type: "location",
        hasMedia: false
      };
    case "contacts":
      return { body: "", type: "vcard", hasMedia: false };
    case "button":
      return { body: msg.button?.text || "", type: "chat", hasMedia: false };
    case "interactive":
      return {
        body:
          msg.interactive?.button_reply?.title ||
          msg.interactive?.list_reply?.title ||
          "",
        type: "chat",
        hasMedia: false
      };
    default:
      return { body: "", type: "chat", hasMedia: false };
  }
}

export function mapMetaMessage(
  msg: any,
  value: any,
  whatsappId: number
): MappedMetaMessage {
  const isGroup = Boolean(msg.group_id);
  const content = mapMetaContent(msg);
  const fromMe = Boolean(msg.from_me);

  const businessNumber = String(
    value?.metadata?.display_phone_number ||
      value?.metadata?.phone_number_id ||
      ""
  ).replace(/\D/g, "");
  const from = String(msg.from || "").replace(/\D/g, "");

  const profile = Array.isArray(value?.contacts)
    ? value.contacts.find(
        (c: any) => String(c.wa_id).replace(/\D/g, "") === from
      )
    : null;

  const message: MessagePayload = {
    id: msg.id,
    body: content.body,
    fromMe,
    hasMedia: content.hasMedia,
    type: content.type,
    timestamp: Number(msg.timestamp) || 0,
    from: fromMe ? businessNumber : from,
    to: fromMe ? from : businessNumber
  };

  const contact: ContactPayload = {
    name: profile?.profile?.name || from,
    number: from,
    isGroup
  };

  const context: WhatsappContextPayload = {
    whatsappId,
    unreadMessages: fromMe ? 0 : 1,
    groupContact: isGroup
      ? {
          name: String(msg.group_id || ""),
          number: String(msg.group_id || "").replace(/@g\.us$/, ""),
          isGroup: true
        }
      : undefined
  };

  return { message, contact, context };
}

// Extract every message + status from a Meta Cloud API webhook envelope.
export function parseMetaWebhook(
  body: any,
  whatsappId: number
): {
  messages: MappedMetaMessage[];
  statuses: { messageId: string; ack: MessageAck }[];
} {
  const messages: MappedMetaMessage[] = [];
  const statuses: { messageId: string; ack: MessageAck }[] = [];

  const entries = Array.isArray(body?.entry) ? body.entry : [];
  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const value = change?.value || {};
      if (Array.isArray(value.messages)) {
        for (const msg of value.messages) {
          messages.push(mapMetaMessage(msg, value, whatsappId));
        }
      }
      if (Array.isArray(value.statuses)) {
        for (const st of value.statuses) {
          if (st?.id) {
            statuses.push({ messageId: st.id, ack: mapMetaAck(st.status) });
          }
        }
      }
    }
  }

  return { messages, statuses };
}

// A Meta Cloud API webhook body is recognisable by its { object, entry } shape.
export function isMetaWebhook(body: any): boolean {
  return Boolean(body?.object) && Array.isArray(body?.entry);
}
