import { mapWameMessage } from "../../providers/WhatsApp/Implementations/wameMapper";
import { MediaPayload } from "../../handlers/handleWhatsappEvents";
import { mapWameAck } from "../../providers/WhatsApp/Implementations/wameMapper";

export interface WameWebhookDeps {
  onMessage: (msg: any, contact: any, context: any, media?: MediaPayload) => Promise<void> | void;
  onAck: (messageId: string, ack: number) => Promise<void> | void;
  onConnection: (status: string, data: any) => Promise<void> | void;
  onQrcode: (code: string) => Promise<void> | void;
  getMedia: (messageId: string) => Promise<{ base64: string; mimetype: string } | null>;
}

export async function handleWameWebhook(
  whatsappId: number,
  event: { type: string; data: any },
  deps: WameWebhookDeps
): Promise<void> {
  const { type, data } = event;

  switch (type) {
    case "message":
    case "messageFromMe": {
      const { message, contact, context } = mapWameMessage(data, whatsappId);
      let media: MediaPayload | undefined;
      if (message.hasMedia) {
        const fetched = await deps.getMedia(data.messageId);
        if (fetched?.base64) {
          const ext = (fetched.mimetype || "application/octet-stream").split("/")[1]?.split(";")[0] || "bin";
          media = {
            filename: `${data.messageId}.${ext}`,
            mimetype: fetched.mimetype,
            data: fetched.base64
          };
        }
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
      // eventos não mapeados no MVP (presence, history, contacts, call) são ignorados
      return;
  }
}
