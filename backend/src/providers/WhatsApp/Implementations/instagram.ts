import axios from "axios";
import { basename } from "node:path";
import Whatsapp from "../../../models/Whatsapp.js";
import { logger } from "../../../utils/logger.js";
import {
  InstagramSession,
  GraphApiSendResponse,
  TOKEN_EXPIRY_SECONDS,
  TOKEN_REFRESH_THRESHOLD_MS,
  emitSessionUpdate,
  getPublicBaseUrl,
  parseInstagramSession,
  toIgsid,
  fromIgsid,
  graphGet,
  graphPost,
  isInvalidTokenError,
  refreshLongLivedToken
} from "../../../helpers/instagram.js";
import {
  instagramSessionRegistry,
  disconnectInstagramConnection
} from "../../../helpers/instagramSessionRegistry.js";
import AppError from "../../../errors/AppError.js";
import type { WhatsappProvider } from "../whatsappProvider.js";
import type {
  ProviderMessage,
  ProviderContact,
  ProviderMediaInput,
  SendMessageOptions,
  SendMediaOptions
} from "../types/index.js";

// ─── Utilities ───────────────────────────────────────────────────────────────

const resolveAttachmentType = (mimetype: string): string => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";
  return "file";
};

const extractMessageId = (result: GraphApiSendResponse): string => {
  if (!result.message_id) {
    throw new AppError("ERR_INSTAGRAM_NO_MESSAGE_ID", 500);
  }
  return result.message_id;
};

// ─── Provider implementation ────────────────────────────────────────────────

const init = async (whatsapp: Whatsapp): Promise<void> => {
  const session = parseInstagramSession(whatsapp.session);

  if (!session) {
    await whatsapp.update({ status: "WAITING_LOGIN" });
    emitSessionUpdate(whatsapp);
    return;
  }

  try {
    await graphGet<{ user_id: string; username: string }>(
      "/me",
      session.accessToken,
      { fields: "user_id,username" }
    );
    instagramSessionRegistry.load(whatsapp.id, session);
    await whatsapp.update({ status: "CONNECTED" });
    emitSessionUpdate(whatsapp);
    logger.info({
      info: "Instagram: session restored",
      whatsappId: whatsapp.id,
      username: session.username
    });
  } catch (err) {
    const errCode = axios.isAxiosError(err)
      ? err.response?.data?.error?.code
      : undefined;
    logger.warn({
      info: "Instagram: token validation failed",
      whatsappId: whatsapp.id,
      errCode
    });
    const status = isInvalidTokenError(err) ? "WAITING_LOGIN" : "DISCONNECTED";
    const update =
      status === "WAITING_LOGIN" ? { status, session: "" } : { status };
    await whatsapp.update(update);
    emitSessionUpdate(whatsapp);
  }
};

const removeSession = (whatsappId: number): void => {
  instagramSessionRegistry.remove(whatsappId);
};

const logout = async (sessionId: number): Promise<void> => {
  const whatsapp = await Whatsapp.findByPk(sessionId);
  if (whatsapp) {
    await disconnectInstagramConnection(whatsapp);
  } else {
    instagramSessionRegistry.remove(sessionId);
  }
};

const sendMessage = async (
  sessionId: number,
  to: string,
  body: string,
  _options?: SendMessageOptions
): Promise<ProviderMessage> => {
  const s = instagramSessionRegistry.getByWhatsappId(sessionId);
  if (!s) throw new AppError("ERR_INSTAGRAM_SESSION_NOT_FOUND", 404);

  const result = await graphPost<GraphApiSendResponse>(
    "/me/messages",
    s.accessToken,
    { recipient: { id: toIgsid(to) }, message: { text: body } }
  );

  return {
    id: extractMessageId(result),
    body,
    fromMe: true,
    hasMedia: false,
    type: "chat",
    timestamp: Math.floor(Date.now() / 1000),
    from: fromIgsid(s.instagramAccountId),
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
  const s = instagramSessionRegistry.getByWhatsappId(sessionId);
  if (!s) throw new AppError("ERR_INSTAGRAM_SESSION_NOT_FOUND", 404);

  const attachmentType = resolveAttachmentType(media.mimetype);
  const filename = media.path ? basename(media.path) : media.filename;
  const mediaUrl = media.path
    ? `${getPublicBaseUrl()}/public/${filename}`
    : null;

  const message = mediaUrl
    ? {
        attachment: {
          type: attachmentType,
          payload: { url: mediaUrl, is_reusable: false }
        }
      }
    : { text: options?.caption || media.filename };

  const result = await graphPost<GraphApiSendResponse>("/me/messages", s.accessToken, {
    recipient: { id: toIgsid(to) },
    message
  });

  return {
    id: extractMessageId(result),
    body: options?.caption || media.filename,
    fromMe: true,
    hasMedia: true,
    type: attachmentType as ProviderMessage["type"],
    timestamp: Math.floor(Date.now() / 1000),
    from: fromIgsid(s.instagramAccountId),
    to,
    ack: 2
  };
};

const getProfilePicUrl = async (
  sessionId: number,
  number: string
): Promise<string> => {
  const s = instagramSessionRegistry.getByWhatsappId(sessionId);
  if (!s) return "";
  try {
    const data = await graphGet<{ profile_pic?: string }>(
      `/${toIgsid(number)}`,
      s.accessToken,
      { fields: "profile_pic" }
    );
    return data.profile_pic || "";
  } catch {
    return "";
  }
};

/** Instagram Messaging API does not support message deletion. */
const deleteMessage = async (): Promise<void> => {
  throw new AppError("ERR_NOT_SUPPORTED_BY_INSTAGRAM", 422);
};

/** Instagram contact IDs are passed through as-is (IGSID prefixed with "ig_"). */
const checkNumber = async (
  _sessionId: number,
  number: string
): Promise<string> => number;

/** Instagram Messaging API does not provide contact lists. */
const getContacts = async (): Promise<ProviderContact[]> => {
  throw new AppError("ERR_NOT_SUPPORTED_BY_INSTAGRAM", 422);
};

/** Instagram Messaging API does not support marking messages as read via business account. */
const sendSeen = async (): Promise<void> => {};

/** Instagram Messaging API does not support fetching historical messages. */
const fetchChatMessages = async (): Promise<ProviderMessage[]> => {
  throw new AppError("ERR_NOT_SUPPORTED_BY_INSTAGRAM", 422);
};

// ─── Token refresh (called from server.ts daily job) ─────────────────────────

const refreshOneToken = async (conn: Whatsapp): Promise<void> => {
  const session = parseInstagramSession(conn.session);
  if (!session?.tokenExpiresAt) return;

  const expiresAt = new Date(session.tokenExpiresAt).getTime();
  if (expiresAt - Date.now() > TOKEN_REFRESH_THRESHOLD_MS) return;

  try {
    const data = await refreshLongLivedToken(session.accessToken);

    const newExpiry = new Date(
      Date.now() + (data.expires_in || TOKEN_EXPIRY_SECONDS) * 1000
    ).toISOString();

    const updated: InstagramSession = {
      ...session,
      accessToken: data.access_token,
      tokenExpiresAt: newExpiry
    };

    await conn.update({ session: JSON.stringify(updated) });
    instagramSessionRegistry.load(conn.id, updated);
    logger.info({
      info: "Instagram: token refreshed",
      whatsappId: conn.id,
      username: session.username
    });
  } catch (err) {
    logger.error({
      info: "Instagram: token refresh failed",
      whatsappId: conn.id,
      err
    });
  }
};

const REFRESH_BATCH_SIZE = 5;

export const refreshInstagramTokens = async (): Promise<void> => {
  const connections = await Whatsapp.findAll({
    where: { channel: "instagram", status: "CONNECTED" }
  });

  for (let i = 0; i < connections.length; i += REFRESH_BATCH_SIZE) {
    await Promise.all(
      connections.slice(i, i + REFRESH_BATCH_SIZE).map(refreshOneToken)
    );
  }
};

// ─── Export ─────────────────────────────────────────────────────────────────

export const InstagramProvider: WhatsappProvider = {
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
