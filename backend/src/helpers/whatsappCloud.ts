import axios from "axios";
import { Request } from "express";
import whatsappCloudConfig from "../config/whatsappCloud.js";
import { metaGraphGet, metaGraphPost } from "./metaGraph.js";
import { verifyMetaSignature } from "./metaWebhookSignature.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WhatsAppCloudSession {
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
}

export interface WACWebhookPayload {
  object: string;
  entry: WACWebhookEntry[];
}

export interface WACWebhookEntry {
  id: string;
  changes: WACWebhookChange[];
}

export interface WACWebhookChange {
  value: WACChangeValue;
  field: string;
}

export interface WACChangeValue {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: Array<{
    profile: { name: string };
    wa_id: string;
  }>;
  messages?: WACMessage[];
  statuses?: WACStatus[];
}

export interface WACMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  video?: { id: string; mime_type: string };
  audio?: { id: string; mime_type: string; voice?: boolean };
  document?: { id: string; mime_type: string; filename?: string };
  sticker?: { id: string; mime_type: string };
  location?: { latitude: number; longitude: number };
  reaction?: { message_id: string; emoji: string };
}

export interface WACStatus {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const parseWhatsAppCloudSession = (
  raw: string | null | undefined
): WhatsAppCloudSession | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.phoneNumberId || !parsed.accessToken) return null;
    return parsed as WhatsAppCloudSession;
  } catch {
    return null;
  }
};

const wacAuth = (token: string) =>
  ({ mode: "header", baseUrl: whatsappCloudConfig.graphBaseUrl, token } as const);

export const graphGet = <T = Record<string, unknown>>(
  path: string,
  token: string,
  params?: Record<string, string>
): Promise<T> => metaGraphGet<T>(path, wacAuth(token), params);

export const graphPost = <T = Record<string, unknown>>(
  path: string,
  token: string,
  data: object
): Promise<T> => metaGraphPost<T>(path, wacAuth(token), data);

export const verifyWACSignature = (req: Request): boolean =>
  verifyMetaSignature(req, whatsappCloudConfig.appSecret);

export const downloadWACMedia = async (
  mediaId: string,
  token: string
): Promise<{ data: Buffer; contentType: string } | null> => {
  try {
    const meta = await graphGet<{ url: string; mime_type: string }>(
      `/${mediaId}`,
      token
    );
    const res = await axios.get<ArrayBuffer>(meta.url, {
      responseType: "arraybuffer",
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30_000
    });
    return { data: Buffer.from(res.data), contentType: meta.mime_type };
  } catch {
    return null;
  }
};
