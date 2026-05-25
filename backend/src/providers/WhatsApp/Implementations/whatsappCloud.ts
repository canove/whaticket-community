import { basename } from "node:path";
import Whatsapp from "../../../models/Whatsapp.js";
import { logger } from "../../../utils/logger.js";
import AppError from "../../../errors/AppError.js";
import {
  parseWhatsAppCloudSession,
  graphGet,
  graphPost,
  downloadWACMedia
} from "../../../helpers/whatsappCloud.js";
import {
  whatsappCloudSessionRegistry,
  disconnectWhatsAppCloudConnection
} from "../../../helpers/whatsappCloudSessionRegistry.js";
import { emitWhatsappSessionUpdate as emitSessionUpdate } from "../../../helpers/emitWhatsappSessionUpdate.js";
import type { WhatsappProvider } from "../whatsappProvider.js";
import type {
  ProviderMessage,
  ProviderContact,
  ProviderMediaInput,
  SendMessageOptions,
  SendMediaOptions
} from "../types/index.js";

const MEDIA_TYPE_MAP: Record<string, string> = {
  "image/": "image",
  "video/": "video",
  "audio/": "audio"
};

const resolveMediaType = (mimetype: string): string => {
  for (const [prefix, type] of Object.entries(MEDIA_TYPE_MAP)) {
    if (mimetype.startsWith(prefix)) return type;
  }
  return "document";
};

// ─── Provider ────────────────────────────────────────────────────────────────

const init = async (whatsapp: Whatsapp): Promise<void> => {
  const session = parseWhatsAppCloudSession(whatsapp.session);

  if (!session) {
    await whatsapp.update({ status: "WAITING_LOGIN" });
    emitSessionUpdate(whatsapp);
    return;
  }

  whatsappCloudSessionRegistry.load(whatsapp.id, session);

  try {
    await graphGet<{ id: string }>(
      `/${session.phoneNumberId}`,
      session.accessToken,
      { fields: "id,display_phone_number,verified_name" }
    );
    if (whatsapp.status !== "CONNECTED") {
      await whatsapp.update({ status: "CONNECTED" });
      emitSessionUpdate(whatsapp);
    }
    logger.info({
      info: "WhatsApp Cloud: session restored",
      whatsappId: whatsapp.id,
      phoneNumberId: session.phoneNumberId
    });
  } catch (err) {
    logger.warn({
      info: "WhatsApp Cloud: token validation failed on init, keeping registry",
      whatsappId: whatsapp.id,
      err
    });
  }
};

const removeSession = (whatsappId: number): void => {
  whatsappCloudSessionRegistry.remove(whatsappId);
};

const logout = async (sessionId: number): Promise<void> => {
  const whatsapp = await Whatsapp.findByPk(sessionId);
  if (whatsapp) {
    await disconnectWhatsAppCloudConnection(whatsapp);
  } else {
    whatsappCloudSessionRegistry.remove(sessionId);
  }
};

const META_ERROR_NOT_REGISTERED = 133010;

const wrapGraphError = (err: any): never => {
  const code = err?.response?.data?.error?.code;
  const message = err?.response?.data?.error?.message;
  if (code === META_ERROR_NOT_REGISTERED) {
    throw new AppError(
      "Número não registrado na Cloud API. Se sua conta é SMB (WhatsApp Business), complete a verificação em business.facebook.com/wa/manage. Se for Tech Provider, clique em \"Registrar número\" em Conexões para configurar o PIN.",
      400
    );
  }
  if (message) throw new AppError(`WhatsApp Cloud: ${message}`, 400);
  throw err;
};

const sendMessage = async (
  sessionId: number,
  to: string,
  body: string,
  _options?: SendMessageOptions
): Promise<ProviderMessage> => {
  const s = whatsappCloudSessionRegistry.getByWhatsappId(sessionId);
  if (!s) throw new AppError("ERR_WAC_SESSION_NOT_FOUND", 404);

  const result = await graphPost<{ messages?: Array<{ id: string }> }>(
    `/${s.phoneNumberId}/messages`,
    s.accessToken,
    { messaging_product: "whatsapp", to, type: "text", text: { body } }
  ).catch(wrapGraphError);

  const messageId = result.messages?.[0]?.id;
  if (!messageId) throw new AppError("ERR_WAC_NO_MESSAGE_ID", 500);

  return {
    id: messageId,
    body,
    fromMe: true,
    hasMedia: false,
    type: "chat",
    timestamp: Math.floor(Date.now() / 1000),
    from: s.phoneNumberId,
    to,
    ack: 2
  };
};

const sendMedia = async (
  sessionId: number,
  to: string,
  media: ProviderMediaInput,
  options?: SendMediaOptions
): Promise<ProviderMessage> => {
  const s = whatsappCloudSessionRegistry.getByWhatsappId(sessionId);
  if (!s) throw new AppError("ERR_WAC_SESSION_NOT_FOUND", 404);

  if (!media.path) {
    return sendMessage(sessionId, to, options?.caption || media.filename);
  }

  const mediaType = resolveMediaType(media.mimetype);
  const publicUrl = `${process.env.BACKEND_URL}/public/${basename(media.path)}`;

  const mediaPayload: Record<string, unknown> = { link: publicUrl };
  if (options?.caption && mediaType !== "audio") {
    mediaPayload.caption = options.caption;
  }

  const result = await graphPost<{ messages?: Array<{ id: string }> }>(
    `/${s.phoneNumberId}/messages`,
    s.accessToken,
    {
      messaging_product: "whatsapp",
      to,
      type: mediaType,
      [mediaType]: mediaPayload
    }
  ).catch(wrapGraphError);

  const messageId = result.messages?.[0]?.id;
  if (!messageId) throw new AppError("ERR_WAC_NO_MESSAGE_ID", 500);

  return {
    id: messageId,
    body: options?.caption || media.filename,
    fromMe: true,
    hasMedia: true,
    type: mediaType as ProviderMessage["type"],
    timestamp: Math.floor(Date.now() / 1000),
    from: s.phoneNumberId,
    to,
    ack: 2
  };
};

const getProfilePicUrl = async (): Promise<string> => "";

const deleteMessage = async (): Promise<void> => {
  throw new AppError("ERR_NOT_SUPPORTED_BY_WAC", 422);
};

const checkNumber = async (
  _sessionId: number,
  number: string
): Promise<string> => number;

const getContacts = async (): Promise<ProviderContact[]> => {
  throw new AppError("ERR_NOT_SUPPORTED_BY_WAC", 422);
};

const sendSeen = async (): Promise<void> => {};

const fetchChatMessages = async (): Promise<ProviderMessage[]> => {
  throw new AppError("ERR_NOT_SUPPORTED_BY_WAC", 422);
};

export { downloadWACMedia };

export const WhatsAppCloudProvider: WhatsappProvider = {
  init,
  removeSession,
  logout,
  sendMessage,
  sendMedia,
  deleteMessage,
  checkNumber,
  getProfilePicUrl,
  getContacts,
  sendSeen,
  fetchChatMessages
};
