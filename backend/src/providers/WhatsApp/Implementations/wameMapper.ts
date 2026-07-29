import { MessageType, MessageAck, ProviderMessage } from "../types";
import {
  MessagePayload,
  ContactPayload,
  WhatsappContextPayload
} from "../../../handlers/handleWhatsappEvents";

export interface MappedWameMessage {
  message: MessagePayload;
  contact: ContactPayload;
  context: WhatsappContextPayload;
}

export function mapWameContent(
  messageType: string,
  msgContent: any
): { body: string; type: MessageType; hasMedia: boolean; sendAudioAsVoice: boolean } {
  const c = msgContent || {};
  switch (messageType) {
    case "conversation":
      return { body: c.conversation || "", type: "chat", hasMedia: false, sendAudioAsVoice: false };
    case "extendedTextMessage":
      return { body: c.extendedTextMessage?.text || "", type: "chat", hasMedia: false, sendAudioAsVoice: false };
    case "imageMessage":
      return { body: c.imageMessage?.caption || "", type: "image", hasMedia: true, sendAudioAsVoice: false };
    case "videoMessage":
      return { body: c.videoMessage?.caption || "", type: "video", hasMedia: true, sendAudioAsVoice: false };
    case "audioMessage": {
      const ptt = Boolean(c.audioMessage?.ptt);
      return { body: "", type: ptt ? "ptt" : "audio", hasMedia: true, sendAudioAsVoice: ptt };
    }
    case "documentMessage":
      return {
        body: c.documentMessage?.caption || c.documentMessage?.fileName || "",
        type: "document",
        hasMedia: true,
        sendAudioAsVoice: false
      };
    case "stickerMessage":
      return { body: "", type: "sticker", hasMedia: true, sendAudioAsVoice: false };
    case "locationMessage": {
      const lat = c.locationMessage?.degreesLatitude ?? "";
      const lng = c.locationMessage?.degreesLongitude ?? "";
      return { body: `${lat},${lng}`, type: "location", hasMedia: false, sendAudioAsVoice: false };
    }
    case "contactMessage":
    case "contactsArrayMessage":
      return { body: c.contactMessage?.vcard || "", type: "vcard", hasMedia: false, sendAudioAsVoice: false };
    default:
      return { body: "", type: "chat", hasMedia: false, sendAudioAsVoice: false };
  }
}

// Baileys WAMessageStatus (1..5) → whaticket MessageAck (0..4)
export function mapWameAck(status: number | null | undefined): MessageAck {
  switch (status) {
    case 2:
      return 1;
    case 3:
      return 2;
    case 4:
      return 3;
    case 5:
      return 4;
    default:
      return 0;
  }
}

export function mapWameMessage(data: any, whatsappId: number): MappedWameMessage {
  const isGroup = Boolean(data.isGroup);
  const content = mapWameContent(data.messageType, data.msgContent);

  const number = String(data.phoneNumber || data.remoteJid || data.from || "").replace(/\D/g, "");

  const message: MessagePayload = {
    id: data.messageId,
    body: content.body,
    fromMe: Boolean(data.me),
    hasMedia: Boolean(data.isMedia) || content.hasMedia,
    type: content.type,
    timestamp: Number(data.messageTimestamp) || 0,
    from: String(data.from || ""),
    to: String(data.to || ""),
    ack: mapWameAck(data.status)
  };

  const contact: ContactPayload = {
    name: data.pushName && data.pushName !== "unknown" ? data.pushName : number,
    number,
    lid: data.lid || undefined,
    isGroup
  };

  const context: WhatsappContextPayload = {
    whatsappId,
    unreadMessages: Boolean(data.me) ? 0 : 1,
    groupContact: isGroup
      ? {
          name: data.pushName || String(data.from || ""),
          number: String(data.from || "").replace(/@g\.us$/, ""),
          isGroup: true
        }
      : undefined
  };

  return { message, contact, context };
}
