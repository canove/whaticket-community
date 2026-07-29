import {
  mapWameMessage,
  mapWameAck
} from "../../providers/WhatsApp/Implementations/wameMapper";
import {
  parseMetaWebhook,
  isMetaWebhook
} from "../../providers/WhatsApp/Implementations/wameMetaMapper";
import { MediaPayload } from "../../handlers/handleWhatsappEvents";

export interface WameWebhookDeps {
  onMessage: (
    msg: any,
    contact: any,
    context: any,
    media?: MediaPayload
  ) => Promise<void> | void;
  onAck: (messageId: string, ack: number) => Promise<void> | void;
  onConnection: (status: string, data: any) => Promise<void> | void;
  onQrcode: (code: string) => Promise<void> | void;
  getMedia: (
    messageId: string
  ) => Promise<{ base64: string; mimetype: string } | null>;
}

const toMediaPayload = async (
  messageId: string,
  getMedia: WameWebhookDeps["getMedia"]
): Promise<MediaPayload | undefined> => {
  const fetched = await getMedia(messageId);
  if (!fetched?.base64) return undefined;
  const ext =
    (fetched.mimetype || "application/octet-stream")
      .split("/")[1]
      ?.split(";")[0] || "bin";
  return {
    filename: `${messageId}.${ext}`,
    mimetype: fetched.mimetype,
    data: fetched.base64
  };
};

// The wame webhook arrives in one of two shapes:
//  - Meta / WhatsApp Cloud API envelope ({ object, entry }) → messages & statuses
//  - native envelope ({ instance, type, data }) → connection, qrcode (and, when
//    the instance is in native mode, messages/statuses too)
// In "meta" mode the instance still sends connection/qrcode in the native shape,
// so we detect the payload per request instead of trusting a single format.
export async function handleWameWebhook(
  whatsappId: number,
  body: any,
  deps: WameWebhookDeps
): Promise<void> {
  // ---- Meta / Cloud API envelope: messages + statuses ----
  if (isMetaWebhook(body)) {
    const { messages, statuses } = parseMetaWebhook(body, whatsappId);

    for (const { message, contact, context } of messages) {
      let media: MediaPayload | undefined;
      if (message.hasMedia) {
        media = await toMediaPayload(message.id, deps.getMedia);
      }
      await deps.onMessage(message, contact, context, media);
    }

    for (const st of statuses) {
      await deps.onAck(st.messageId, st.ack);
    }
    return;
  }

  // ---- native envelope: connection / qrcode / native messages ----
  const type = body?.type;
  const data = body?.data;

  switch (type) {
    case "message":
    case "messageFromMe": {
      const { message, contact, context } = mapWameMessage(data, whatsappId);
      let media: MediaPayload | undefined;
      if (message.hasMedia) {
        media = await toMediaPayload(data.messageId, deps.getMedia);
      }
      await deps.onMessage(message, contact, context, media);
      return;
    }
    case "messageStatus":
    case "messageReceipt":
      if (data?.messageId) {
        await deps.onAck(data.messageId, mapWameAck(data.status));
      }
      return;
    case "connection":
    case "health":
      await deps.onConnection(data?.status, data);
      return;
    case "qrcode":
      if (data?.code) await deps.onQrcode(data.code);
      return;
    default:
      // unmapped events (presence, history, contacts, call) are ignored
      return;
  }
}
