import axios from "axios";
import Whatsapp from "../models/Whatsapp.js";
import { logger } from "../utils/logger.js";
import instagramConfig from "../config/instagram.js";
import { emitWhatsappSessionUpdate } from "./emitWhatsappSessionUpdate.js";
import {
  metaGraphGet,
  metaGraphPost,
  metaGraphDelete,
  GRAPH_TIMEOUT_MS as META_GRAPH_TIMEOUT_MS
} from "./metaGraph.js";
import AppError from "../errors/AppError.js";

// ─── Shared types ────────────────────────────────────────────────────────────

export interface InstagramSession {
  accessToken: string;
  instagramAccountId: string;
  username: string;
  name?: string;
  tokenExpiresAt?: string;
}

export interface MetaWebhookPayload {
  object: string;
  entry: MetaWebhookEntry[];
}

export interface MetaWebhookEntry {
  id: string;
  time: number;
  messaging: MetaMessagingEvent[];
}

export interface MetaMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: MetaMessage;
  read?: { watermark: number };
  delivery?: { watermark: number };
}

export interface MetaMessage {
  mid: string;
  text?: string;
  attachments?: MetaAttachment[];
  is_echo?: boolean;
}

export interface MetaAttachment {
  type: string;
  payload: { url?: string };
}

export interface GraphApiSendResponse {
  message_id?: string;
  recipient_id?: string;
}

export interface ShortLivedTokenResponse {
  access_token: string;
  user_id: string;
  permissions?: string;
}

export interface LongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface InstagramUserInfo {
  user_id: string;
  username: string;
  name?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const IG_PREFIX = "ig_";
export const TOKEN_EXPIRY_SECONDS = 5184000; // 60 days
export const TOKEN_REFRESH_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const TOKEN_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 1 day

// Meta Graph API error codes that indicate an invalid/expired token
const META_ERROR_INVALID_TOKEN = 190;
const META_ERROR_SESSION_EXPIRED = 102;

export const GRAPH_TIMEOUT_MS = META_GRAPH_TIMEOUT_MS;

const IG_PREFIX_REGEX = /^ig_/;

// ─── Shared helpers ──────────────────────────────────────────────────────────

export const toIgsid = (prefixedId: string): string =>
  prefixedId.replace(IG_PREFIX_REGEX, "");

export const fromIgsid = (rawId: string): string => `${IG_PREFIX}${rawId}`;

export const parseInstagramSession = (
  raw: string | null | undefined
): InstagramSession | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.accessToken || !parsed.instagramAccountId) return null;
    return parsed as InstagramSession;
  } catch {
    return null;
  }
};

export const emitSessionUpdate = emitWhatsappSessionUpdate;

export const getPublicBaseUrl = (): string => {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
  const proxyPortRaw = process.env.PROXY_PORT;
  if (proxyPortRaw) {
    const parsed = parseInt(proxyPortRaw, 10);
    if (Number.isFinite(parsed) && parsed > 0 && parsed < 65536) {
      return `${backendUrl}:${parsed}`;
    }
  }
  return backendUrl;
};

// ─── Graph API wrappers ──────────────────────────────────────────────────────

const igAuth = (token: string) =>
  ({ mode: "query", baseUrl: instagramConfig.graphBaseUrl, token } as const);

export const graphGet = <T = Record<string, unknown>>(
  path: string,
  token: string,
  params?: Record<string, string>
): Promise<T> => metaGraphGet<T>(path, igAuth(token), params);

export const graphPost = <T = Record<string, unknown>>(
  path: string,
  token: string,
  data: object
): Promise<T> => metaGraphPost<T>(path, igAuth(token), data);

export const graphDelete = <T = Record<string, unknown>>(
  path: string,
  token: string
): Promise<T> => metaGraphDelete<T>(path, igAuth(token));

export const isInvalidTokenError = (err: unknown): boolean => {
  if (!axios.isAxiosError(err)) return false;
  const code: number | undefined = err.response?.data?.error?.code;
  return (
    code === META_ERROR_INVALID_TOKEN || code === META_ERROR_SESSION_EXPIRED
  );
};

// ─── OAuth token exchange (Instagram Business Login) ─────────────────────────

/**
 * Exchanges authorization code for a short-lived Instagram User access token.
 * Uses api.instagram.com (form-encoded), not the Graph API.
 */
export const exchangeCodeForShortLivedToken = async (
  code: string,
  redirectUri: string
): Promise<ShortLivedTokenResponse> => {
  const params = new URLSearchParams();
  params.append("client_id", instagramConfig.appId);
  params.append("client_secret", instagramConfig.appSecret);
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", redirectUri);
  params.append("code", code);

  const res = await axios.post<ShortLivedTokenResponse>(
    `${instagramConfig.apiBaseUrl}/oauth/access_token`,
    params,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: GRAPH_TIMEOUT_MS
    }
  );
  return res.data;
};

/**
 * Exchanges a short-lived token for a long-lived (60-day) Instagram User token.
 */
export const exchangeShortForLongLivedToken = async (
  shortLivedToken: string
): Promise<LongLivedTokenResponse> => {
  const res = await axios.get<LongLivedTokenResponse>(
    `${instagramConfig.graphRootUrl}/access_token`,
    {
      params: {
        grant_type: "ig_exchange_token",
        client_secret: instagramConfig.appSecret,
        access_token: shortLivedToken
      },
      timeout: GRAPH_TIMEOUT_MS
    }
  );
  return res.data;
};

/**
 * Refreshes a long-lived Instagram User access token (extends another 60 days).
 */
export const refreshLongLivedToken = async (
  longLivedToken: string
): Promise<LongLivedTokenResponse> => {
  const res = await axios.get<LongLivedTokenResponse>(
    `${instagramConfig.graphRootUrl}/refresh_access_token`,
    {
      params: {
        grant_type: "ig_refresh_token",
        access_token: longLivedToken
      },
      timeout: GRAPH_TIMEOUT_MS
    }
  );
  return res.data;
};

/**
 * Fetches the authenticated Instagram Business account user_id and username.
 */
export const getAuthenticatedUserInfo = async (
  accessToken: string
): Promise<InstagramUserInfo> => {
  const data = await graphGet<{
    user_id?: string;
    username?: string;
    name?: string;
  }>("/me", accessToken, { fields: "user_id,username,name" });
  if (!data.user_id || !data.username) {
    throw new Error("Instagram /me did not return user_id/username");
  }
  return {
    user_id: data.user_id,
    username: data.username,
    name: data.name
  };
};

// ─── Webhook subscription helpers ────────────────────────────────────────────

export const subscribeInstagramWebhooks = async (
  accessToken: string
): Promise<void> => {
  try {
    await axios.post(
      `${instagramConfig.graphBaseUrl}/me/subscribed_apps`,
      null,
      {
        params: {
          access_token: accessToken,
          subscribed_fields: "messages,messaging_postbacks,message_reactions"
        },
        timeout: GRAPH_TIMEOUT_MS
      }
    );
  } catch (err) {
    const errorData = axios.isAxiosError(err) ? err.response?.data : err;
    logger.error({
      info: "Instagram: webhook subscription failed",
      err: errorData
    });
    throw new AppError(
      "Falha ao registrar webhooks do Instagram. Verifique se a conta é Profissional e o app tem permissões corretas.",
      500
    );
  }
};

export const unsubscribeInstagramWebhooks = async (
  accessToken: string
): Promise<void> => {
  try {
    await graphDelete("/me/subscribed_apps", accessToken);
  } catch (err) {
    logger.warn({
      info: "Instagram: webhook unsubscription failed (non-fatal)",
      err: axios.isAxiosError(err) ? err.response?.data : err
    });
  }
};
