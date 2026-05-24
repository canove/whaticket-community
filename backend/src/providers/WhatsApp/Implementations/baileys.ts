import { promises as fsPromises } from "fs";

import pino from "pino";
import makeWASocket, {
  UserFacingSocketConfig,
  DisconnectReason,
  WASocket,
  AuthenticationCreds,
  initAuthCreds,
  isLidUser,
  isJidUser,
  isJidGroup,
  isJidBroadcast,
  makeCacheableSignalKeyStore,
  BufferJSON,
  WAMessage,
  WAMessageKey,
  downloadMediaMessage,
  getContentType,
  jidNormalizedUser,
  jidDecode,
  SignalDataSet,
  AnyMessageContent,
  proto,
  Browsers,
  fetchLatestBaileysVersion,
  WAVersion,
  CacheStore
} from "@whiskeysockets/baileys";
import { LRUCache } from "lru-cache";
import { Boom } from "@hapi/boom";
import { HttpsProxyAgent } from "https-proxy-agent";
import NodeCache from "node-cache";

import Whatsapp from "../../../models/Whatsapp";
import { getIO } from "../../../libs/socket";
import { logger } from "../../../utils/logger";
import AppError from "../../../errors/AppError";
import StoreWppSessionKeys from "../../../services/WppKeyServices/StoreWppSessionKeys";
import GetWppSessionKeys from "../../../services/WppKeyServices/GetWppSessionKeys";
import { getRedisClient } from "../../../libs/redisStore";
import {
  SendMessageOptions,
  ProviderMessage,
  ProviderMediaInput,
  SendMediaOptions,
  ProviderContact,
  MessageType,
  MessageAck
} from "../types";
import { WhatsappProvider } from "../whatsappProvider";
import { sleep } from "../../../utils/sleep";
import {
  handleMessage,
  handleMessageAck,
  ContactPayload,
  MessagePayload,
  MediaPayload,
  WhatsappContextPayload
} from "../../../handlers/handleWhatsappEvents";
import { getInboundQueue } from "../../../libs/queue";

const PINO_LEVELS = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent"
];
const envLogLevel = process.env.BAILEYS_LOG_LEVEL;
const baileysLevel =
  envLogLevel && PINO_LEVELS.includes(envLogLevel) ? envLogLevel : "silent";

const baileysLogger = pino({ level: baileysLevel }) as any;

interface Session extends WASocket {
  id: number;
}

const sessions = new Map<number, Session>();
const reconnectingGuard = new Set<number>();
const contactedJids = new Map<number, Set<string>>();

const msgRetryNodeCache = new NodeCache({
  stdTTL: 600,
  checkperiod: 60,
  useClones: false
});

const msgRetryCounterCache: CacheStore = {
  get: (key: string) => msgRetryNodeCache.get(key),
  set: (key: string, value: any) => {
    msgRetryNodeCache.set(key, value);
  },
  del: (key: string) => {
    msgRetryNodeCache.del(key);
  },
  flushAll: () => msgRetryNodeCache.flushAll()
};

const msgCacheLRU = new LRUCache<string, string>({
  max: 5000,
  ttl: 600 * 1000,
  allowStale: false,
  updateAgeOnGet: true
});

const normalizeJid = (jid: string): string => {
  if (!jid) return jid;
  if (!jid.includes("@")) return `${jid}@s.whatsapp.net`;
  return jid.replace(/@c\.us$/i, "@s.whatsapp.net");
};

const msgCache = {
  get: (key: WAMessageKey): proto.IMessage | undefined => {
    const { id } = key;
    if (!id) return undefined;
    const data = msgCacheLRU.get(id);
    if (data) {
      try {
        const msg = JSON.parse(data);
        return msg?.message;
      } catch {
        return undefined;
      }
    }
    return undefined;
  },
  save: (msg: WAMessage) => {
    const { id } = msg.key;
    if (!id) return;
    try {
      msgCacheLRU.set(id, JSON.stringify(msg));
    } catch (e) {
      logger.debug({ info: "Error caching message", messageId: id, err: e });
    }
  }
};

const clearSessionKeys = async (sessionId: number): Promise<void> => {
  const client = getRedisClient();
  if (!client) return;

  try {
    const match = `wpp:${sessionId}:*`;

    const scanAndDelete = async (cursor: string): Promise<void> => {
      const [nextCursor, keys] = await client.scan(
        cursor,
        "MATCH",
        match,
        "COUNT",
        100
      );

      if (keys.length > 0) {
        await client.del(keys);
      }

      if (nextCursor !== "0") {
        await scanAndDelete(nextCursor);
      }
    };

    await scanAndDelete("0");

    logger.info({ info: "Cleared Redis session keys", sessionId });
  } catch (err) {
    logger.error({ info: "Error clearing Redis session keys", sessionId, err });
  }
};

const assertUnique = (sessionId: number) => {
  const wbot = sessions.get(sessionId);

  if (wbot) {
    wbot.ev.removeAllListeners("connection.update");
    sessions.delete(sessionId);

    wbot.end(undefined);
  }
};

const saveSessionCreds = async (
  whatsapp: Whatsapp,
  creds: AuthenticationCreds
) => {
  try {
    await whatsapp.update({
      session: JSON.stringify(creds, BufferJSON.replacer),
      status: "CONNECTED",
      qrcode: ""
    });

    logger.debug({
      info: "Creds saved to database",
      whatsappId: whatsapp.id
    });
  } catch (err) {
    logger.error({
      info: "Error saving creds to database",
      whatsappId: whatsapp.id,
      err
    });
  }
};

const credsDebounceTimers = new Map<number, NodeJS.Timeout>();
const pendingCredsSaves = new Map<
  number,
  { whatsapp: Whatsapp; creds: AuthenticationCreds }
>();

const flushPendingCredsSave = async (sessionId: number): Promise<void> => {
  const existingTimer = credsDebounceTimers.get(sessionId);
  if (existingTimer) {
    clearTimeout(existingTimer);
    credsDebounceTimers.delete(sessionId);
  }

  const pending = pendingCredsSaves.get(sessionId);
  if (pending) {
    pendingCredsSaves.delete(sessionId);
    await saveSessionCreds(pending.whatsapp, pending.creds);
  }
};

const debouncedSaveCreds = (
  whatsapp: Whatsapp,
  creds: AuthenticationCreds,
  delayMs = 1000
) => {
  const sessionId = whatsapp.id;

  const existingTimer = credsDebounceTimers.get(sessionId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  pendingCredsSaves.set(sessionId, { whatsapp, creds });

  const timer = setTimeout(() => {
    credsDebounceTimers.delete(sessionId);
    pendingCredsSaves.delete(sessionId);
    saveSessionCreds(whatsapp, creds);
  }, delayMs);

  credsDebounceTimers.set(sessionId, timer);
};

const useSessionAuthState = async (whatsapp: Whatsapp) => {
  const sessionId = whatsapp.id;

  const creds = whatsapp.session
    ? JSON.parse(whatsapp.session, BufferJSON.reviver)
    : initAuthCreds();

  return {
    state: {
      creds: creds as AuthenticationCreds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const deviceId = jidDecode(creds?.me?.id)?.device || 1;

          const data = await GetWppSessionKeys({
            connectionId: sessionId,
            deviceId,
            type,
            ids
          });

          return data;
        },
        set: async (data: SignalDataSet) => {
          const deviceId = jidDecode(creds?.me?.id)?.device || 1;

          try {
            const promises: Promise<void>[] = [];

            Object.entries(data).forEach(([category, categoryData]) => {
              if (!categoryData) return;
              Object.entries(categoryData).forEach(([id, value]) => {
                promises.push(
                  StoreWppSessionKeys({
                    connectionId: sessionId,
                    deviceId,
                    type: category,
                    id,
                    value
                  })
                );
              });
            });

            await Promise.all(promises);
          } catch (err) {
            logger.error({
              info: "Error setting keys",
              sessionId,
              err
            });
          }
        }
      }
    }
  };
};

const mapMessageType = (msg: WAMessage): MessageType => {
  const messageType = getContentType(msg.message || undefined);

  if (messageType === "audioMessage" && msg.message?.audioMessage?.ptt) {
    return "ptt";
  }

  const typeMap: Record<string, MessageType> = {
    conversation: "chat",
    extendedTextMessage: "chat",
    imageMessage: "image",
    videoMessage: "video",
    audioMessage: "audio",
    documentMessage: "document",
    stickerMessage: "sticker",
    locationMessage: "location",
    contactMessage: "vcard",
    contactsArrayMessage: "vcard"
  };

  return typeMap[messageType || ""] || "chat";
};

const getMessageBody = (msg: WAMessage): string => {
  try {
    const messageType = getContentType(msg.message || undefined);

    if (messageType === "conversation") {
      return msg.message?.conversation || "";
    }

    if (messageType === "extendedTextMessage") {
      return msg.message?.extendedTextMessage?.text || "";
    }

    if (messageType === "imageMessage") {
      return msg.message?.imageMessage?.caption || "";
    }

    if (messageType === "videoMessage") {
      return msg.message?.videoMessage?.caption || "";
    }

    if (messageType === "documentMessage") {
      return msg.message?.documentMessage?.caption || "";
    }

    if (messageType === "contactMessage") {
      return msg.message?.contactMessage?.vcard || "";
    }

    if (messageType === "contactsArrayMessage") {
      const contacts = msg.message?.contactsArrayMessage?.contacts || [];
      return contacts.map(c => c.vcard).join("\n");
    }

    if (messageType === "locationMessage") {
      const location = msg.message?.locationMessage;
      if (!location) return "";

      const gmapsUrl = `https://maps.google.com/maps?q=${location.degreesLatitude}%2C${location.degreesLongitude}&z=17&hl=pt-BR`;
      const description =
        location.name ||
        `${location.degreesLatitude}, ${location.degreesLongitude}`;

      return `${gmapsUrl}|${description}`;
    }

    return "";
  } catch (err) {
    logger.error({ info: "Error getting message body", err });
    return "";
  }
};

const getQuotedMessageId = (msg: WAMessage): string | undefined => {
  const quotedMessageId =
    msg.message?.extendedTextMessage?.contextInfo?.stanzaId ||
    msg.message?.imageMessage?.contextInfo?.stanzaId ||
    msg.message?.videoMessage?.contextInfo?.stanzaId ||
    msg.message?.documentMessage?.contextInfo?.stanzaId ||
    undefined;

  return quotedMessageId;
};

const hasMedia = (msg: WAMessage): boolean => {
  const messageType = getContentType(msg.message || undefined);
  return [
    "imageMessage",
    "videoMessage",
    "audioMessage",
    "documentMessage",
    "stickerMessage"
  ].includes(messageType || "");
};

const mapMessageAck = (status: number | null | undefined): MessageAck => {
  if (status === null || status === undefined) return 0;
  if (status >= 4) return 4;
  if (status >= 3) return 3;
  if (status >= 2) return 2;
  if (status >= 1) return 1;
  return 0;
};

const shouldHandleMessage = (msg: WAMessage): boolean => {
  const messageType = getContentType(msg.message || undefined);
  const validTypes = [
    "conversation",
    "extendedTextMessage",
    "imageMessage",
    "videoMessage",
    "audioMessage",
    "documentMessage",
    "stickerMessage",
    "locationMessage",
    "contactMessage",
    "contactsArrayMessage"
  ];

  if (!validTypes.includes(messageType || "")) return false;

  const body = getMessageBody(msg);
  if (/\u200e/.test(body[0])) return false;

  if (!msg.key.fromMe) return true;

  const allowedFromMeTypes = [
    "locationMessage",
    "conversation",
    "extendedTextMessage",
    "contactMessage"
  ];

  return hasMedia(msg) || allowedFromMeTypes.includes(messageType || "");
};

const convertToMessagePayload = (msg: WAMessage): MessagePayload => {
  const fromJid = msg.key.remoteJid || "";
  const toJid = msg.key.fromMe ? fromJid : msg.key.participant || fromJid;
  const fromMe = msg.key.fromMe || false;

  return {
    id: msg.key.id || "",
    body: getMessageBody(msg),
    fromMe,
    hasMedia: hasMedia(msg),
    type: mapMessageType(msg),
    timestamp: msg.messageTimestamp ? Number(msg.messageTimestamp) : Date.now(),
    from: fromJid,
    to: toJid,
    hasQuotedMsg: Boolean(getQuotedMessageId(msg)),
    quotedMsgId: getQuotedMessageId(msg),
    ack: fromMe ? 1 : 0
  };
};

type ExtendedKey = WAMessageKey &
  Partial<{
    senderPn: string;
    sender_pn: string;
    participantPn: string;
    participant_pn: string;
    peerRecipientPn: string;
    peer_recipient_pn: string;
    senderLid: string;
    sender_lid: string;
    participantLid: string;
    participant_lid: string;
    recipientLid: string;
    recipient_lid: string;
  }>;

type ExtendedContext = proto.IContextInfo &
  Partial<{
    senderLid: string;
    sender_lid: string;
    participantLid: string;
    participant_lid: string;
    recipientLid: string;
    recipient_lid: string;
    senderPn: string;
    sender_pn: string;
    participantPn: string;
    participant_pn: string;
    peerRecipientPn: string;
    peer_recipient_pn: string;
  }>;

const convertToContactPayload = async (
  jid: string,
  msg: WAMessage,
  wbot: Session
): Promise<ContactPayload> => {
  const keyExt = (msg.key || {}) as ExtendedKey;
  const content = msg.message || {};
  const ctx = (content?.extendedTextMessage?.contextInfo ||
    content?.imageMessage?.contextInfo ||
    content?.videoMessage?.contextInfo ||
    content?.documentMessage?.contextInfo ||
    content?.audioMessage?.contextInfo ||
    content?.stickerMessage?.contextInfo ||
    undefined) as ExtendedContext | undefined;

  let resolvedJid = jid || "";

  const lidCandidates: (string | undefined)[] = [
    keyExt.senderLid,
    keyExt.participantLid,
    keyExt.recipientLid,
    ctx?.senderLid,
    ctx?.participantLid,
    ctx?.recipientLid,
    keyExt.sender_lid,
    keyExt.participant_lid,
    keyExt.recipient_lid,
    ctx?.sender_lid,
    ctx?.participant_lid,
    ctx?.recipient_lid,
    (keyExt.senderPn || keyExt.sender_pn)?.includes("@lid")
      ? keyExt.senderPn || keyExt.sender_pn
      : undefined,
    (keyExt.participantPn || keyExt.participant_pn)?.includes("@lid")
      ? keyExt.participantPn || keyExt.participant_pn
      : undefined,
    (keyExt.peerRecipientPn || keyExt.peer_recipient_pn)?.includes("@lid")
      ? keyExt.peerRecipientPn || keyExt.peer_recipient_pn
      : undefined
  ];

  const lid = lidCandidates.find(
    cand => typeof cand === "string" && cand.includes("@lid")
  );

  const pnCandidates: (string | undefined)[] = [
    keyExt.senderPn || keyExt.sender_pn,
    keyExt.participantPn || keyExt.participant_pn,
    keyExt.peerRecipientPn || keyExt.peer_recipient_pn
  ];

  const preferPn = pnCandidates.find(
    v => typeof v === "string" && /@s\.whatsapp\.net$/i.test(v)
  );

  if (resolvedJid.endsWith("@lid") && preferPn) {
    resolvedJid = preferPn;
  } else if (
    resolvedJid &&
    !resolvedJid.endsWith("@s.whatsapp.net") &&
    !resolvedJid.endsWith("@g.us") &&
    preferPn
  ) {
    resolvedJid = preferPn;
  }

  const safeNormalized = (value?: string) => {
    if (!value) return "";
    try {
      return jidNormalizedUser(value);
    } catch {
      return value;
    }
  };

  const normalizedJid = safeNormalized(resolvedJid);

  const contactInfo: Record<string, any> = {};

  const chatInfo: Record<string, any> | undefined = undefined;

  let profilePicUrl: string | undefined;

  if (normalizedJid) {
    try {
      const url = await wbot.profilePictureUrl(normalizedJid, "image");
      profilePicUrl = url || undefined;
    } catch (err) {
      logger.debug({
        info: "Could not get profile picture",
        jid: normalizedJid,
        err
      });
    }
  }

  if (isJidGroup(resolvedJid)) {
    const groupNumber = normalizedJid.split("@")[0];
    const groupName =
      contactInfo?.name ||
      contactInfo?.notify ||
      (chatInfo as { name?: string } | undefined)?.name ||
      (chatInfo as { subject?: string } | undefined)?.subject ||
      groupNumber;

    if (!contactInfo && (!groupName || groupName === groupNumber)) {
      try {
        const meta = await wbot.groupMetadata(normalizedJid);
        const metaName = typeof meta?.subject === "string" ? meta.subject : "";
        if (metaName) {
          return {
            name: metaName,
            number: groupNumber,
            isGroup: true,
            profilePicUrl
          };
        }
      } catch {
        /* ignore */
      }
    }

    return {
      name: groupName,
      number: groupNumber,
      isGroup: true,
      profilePicUrl
    };
  }

  const decoded = jidDecode(resolvedJid);

  const sessionPushName = wbot.user?.name?.trim().toLowerCase();
  const incomingPushName = msg.pushName?.trim();
  const pushName =
    incomingPushName &&
    sessionPushName &&
    incomingPushName.toLowerCase() === sessionPushName
      ? undefined
      : incomingPushName;

  const number =
    (resolvedJid?.endsWith("@s.whatsapp.net") && decoded?.user) ||
    jidDecode(preferPn || "")?.user ||
    normalizedJid.split("@")[0];

  const lidValue =
    isLidUser(resolvedJid) && decoded?.user ? `${decoded.user}@lid` : lid;

  const name =
    contactInfo?.name ||
    contactInfo?.notify ||
    pushName ||
    number ||
    lidValue ||
    "";

  return {
    name,
    number,
    lid: lidValue,
    isGroup: false,
    profilePicUrl
  };
};

const convertToMediaPayload = async (
  msg: WAMessage,
  wbot: Session
): Promise<MediaPayload | undefined> => {
  if (!hasMedia(msg)) return undefined;

  // TODO save direct to disc using stream
  try {
    const buffer = await downloadMediaMessage(
      msg,
      "buffer",
      {},
      {
        logger: baileysLogger,
        reuploadRequest: wbot.updateMediaMessage
      }
    );

    const messageType = getContentType(msg.message || undefined);
    const getExtension = (mimetype: string, fallback: string): string =>
      mimetype.split("/")[1]?.split(";")[0] || fallback;

    if (messageType === "imageMessage") {
      const mimetype = msg.message?.imageMessage?.mimetype || "image/jpeg";
      return {
        filename: `image-${Date.now()}.${getExtension(mimetype, "jpg")}`,
        mimetype,
        data: buffer.toString("base64")
      };
    }

    if (messageType === "videoMessage") {
      const mimetype = msg.message?.videoMessage?.mimetype || "video/mp4";
      return {
        filename: `video-${Date.now()}.${getExtension(mimetype, "mp4")}`,
        mimetype,
        data: buffer.toString("base64")
      };
    }

    if (messageType === "audioMessage") {
      const mimetype =
        msg.message?.audioMessage?.mimetype || "audio/ogg; codecs=opus";
      return {
        filename: `audio-${Date.now()}.ogg`,
        mimetype,
        data: buffer.toString("base64")
      };
    }

    if (messageType === "documentMessage") {
      const docMsg = msg.message?.documentMessage;
      const mimetype = docMsg?.mimetype || "application/octet-stream";
      const ext = getExtension(mimetype, "bin");
      return {
        filename: docMsg?.title || `document-${Date.now()}.${ext}`,
        mimetype,
        data: buffer.toString("base64")
      };
    }

    if (messageType === "stickerMessage") {
      const mimetype = msg.message?.stickerMessage?.mimetype || "image/webp";
      return {
        filename: `sticker-${Date.now()}.webp`,
        mimetype,
        data: buffer.toString("base64")
      };
    }

    return {
      filename: "",
      mimetype: "",
      data: buffer.toString("base64")
    };
  } catch (err) {
    logger.error({
      info: "Error downloading media",
      err,
      messageId: msg.key.id
    });

    return undefined;
  }
};

const getMessageData = async (
  msg: WAMessage,
  wbot: Session
): Promise<{
  messagePayload: MessagePayload;
  contactPayload: ContactPayload;
  contextPayload: WhatsappContextPayload;
  mediaPayload: MediaPayload | undefined;
}> => {
  const remoteJid = msg.key.remoteJid || "";
  const isGroup = isJidGroup(remoteJid);

  let contactJid = remoteJid;
  let groupContact;

  if (!msg.key.fromMe && isGroup && msg.key.participant) {
    contactJid = msg.key.participant;
    groupContact = await convertToContactPayload(remoteJid, msg, wbot);
  }

  const contactPayload = await convertToContactPayload(contactJid, msg, wbot);
  const messagePayload = convertToMessagePayload(msg);
  const mediaPayload = await convertToMediaPayload(msg, wbot);

  const contextPayload: WhatsappContextPayload = {
    whatsappId: wbot.id,
    unreadMessages: 0,
    groupContact
  };

  return {
    messagePayload,
    contactPayload,
    contextPayload,
    mediaPayload
  };
};

const getWbot = (sessionId: number): Session => {
  const wbot = sessions.get(sessionId);

  if (!wbot) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }

  return wbot;
};

const removeSession = async (whatsappId: number): Promise<void> => {
  await flushPendingCredsSave(whatsappId);

  const wbot = sessions.get(whatsappId);
  if (wbot) {
    wbot.ev.removeAllListeners("connection.update");
    wbot.ev.removeAllListeners("creds.update");
    wbot.ev.removeAllListeners("messages.upsert");
    wbot.ev.removeAllListeners("messages.update");
    wbot.ev.removeAllListeners("message-receipt.update");
    wbot.ev.removeAllListeners("presence.update");
    wbot.ev.removeAllListeners("groups.upsert");
    wbot.ev.removeAllListeners("groups.update");
    wbot.ev.removeAllListeners("group-participants.update");
    wbot.ev.removeAllListeners("contacts.upsert");
    wbot.ev.removeAllListeners("contacts.update");
    wbot.ev.removeAllListeners("chats.upsert");
    wbot.ev.removeAllListeners("chats.update");
    wbot.ev.removeAllListeners("chats.delete");
    wbot.ev.removeAllListeners("blocklist.set");
    wbot.ev.removeAllListeners("blocklist.update");

    try {
      wbot.end(undefined);
    } catch (e) {
      logger.debug({ info: "Error ending wbot", err: e });
    }

    try {
      wbot.ws?.removeAllListeners?.();
      await wbot.ws?.close?.();
    } catch (e) {
      logger.debug({ info: "Error closing websocket", err: e });
    }
  }

  sessions.delete(whatsappId);
};

const init = async (whatsapp: Whatsapp): Promise<void> => {
  const sessionId = whatsapp.id;
  const io = getIO();

  const { state } = await useSessionAuthState(whatsapp);

  let waVersionToUse: WAVersion | undefined;

  if (process.env.WA_SOCKET_VERSION) {
    try {
      const parsed = JSON.parse(process.env.WA_SOCKET_VERSION) as number[];
      if (Array.isArray(parsed) && parsed.length >= 3) {
        waVersionToUse = parsed as WAVersion;
        logger.info({
          info: "Using WA_SOCKET_VERSION from env",
          version: waVersionToUse.join(".")
        });
      }
    } catch {
      logger.warn({
        info: "Failed to parse WA_SOCKET_VERSION, fetching latest"
      });
    }
  }

  if (!waVersionToUse) {
    try {
      const fetchedVersionData = await fetchLatestBaileysVersion();
      if (fetchedVersionData?.version) {
        waVersionToUse = fetchedVersionData.version;
        logger.info({
          info: "Using latest WA Web version",
          version: waVersionToUse.join(".")
        });
      }
    } catch (e) {
      logger.warn({ info: "Failed to fetch latest WA version, using default" });
    }
  }

  const connOptions: UserFacingSocketConfig = {
    logger: baileysLogger,
    browser: Browsers.ubuntu(process.env.WHATSAPP_BROWSER_NAME || "Chrome"),
    emitOwnEvents: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        baileysLogger,
        new NodeCache({
          useClones: false,
          stdTTL: 60 * 60,
          checkperiod: 60 * 5
        })
      )
    },
    shouldSyncHistoryMessage: () => false,
    shouldIgnoreJid: jid => {
      if (typeof jid !== "string") return false;
      return (
        isJidBroadcast(jid) ||
        jid?.endsWith("newsletter") ||
        jid === "status@broadcast"
      );
    },
    syncFullHistory: false,
    version: waVersionToUse,
    msgRetryCounterCache,
    markOnlineOnConnect: false,
    fireInitQueries: true,
    generateHighQualityLinkPreview: true,
    linkPreviewImageThumbnailWidth: 192,
    defaultQueryTimeoutMs: 60_000,
    connectTimeoutMs: 25_000,
    retryRequestDelayMs: 500,
    keepAliveIntervalMs: 25_000,
    transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 3000 },
    getMessage: async (key: WAMessageKey) => {
      const cached = msgCache.get(key);
      if (cached) return cached;

      return undefined;
    }
  };

  const proxyAddress = process.env.PROXY_ADDRESS || "";
  if (proxyAddress) {
    const proxyAuth = process.env.PROXY_AUTH || "";
    const proxyUrl = proxyAuth
      ? `http://${proxyAuth}@${proxyAddress}`
      : `http://${proxyAddress}`;

    connOptions.agent = new HttpsProxyAgent(proxyUrl);
    connOptions.fetchAgent = new HttpsProxyAgent(proxyUrl);
  }

  assertUnique(sessionId);

  const wbot = makeWASocket(connOptions) as Session;
  wbot.id = sessionId;

  sessions.set(sessionId, wbot);

  wbot.ev.on("creds.update", () => {
    debouncedSaveCreds(whatsapp, state.creds);
  });

  wbot.ev.on("messages.upsert", async ({ messages, type }) => {
    messages.forEach(msg => {
      msgCache.save(msg);
      logger.debug({
        info: "[RAW] Message received",
        sessionId,
        type,
        key: msg.key,
        messageTimestamp: msg.messageTimestamp,
        pushName: msg.pushName,
        status: msg.status,
        messageType: Object.keys(msg.message || {}),
        rawMessage: JSON.stringify(msg, null, 2)
      });
    });

    const validMessages = messages.filter(msg => {
      if (!msg.message || !shouldHandleMessage(msg)) return false;

      if (type === "notify") return true;

      if (type === "append" && msg.key.fromMe) return true;

      return false;
    });

    if (validMessages.length === 0) return;

    await Promise.all(
      validMessages.map(async msg => {
        try {
          const {
            messagePayload,
            contactPayload,
            contextPayload,
            mediaPayload
          } = await getMessageData(msg, wbot);

          const queue = getInboundQueue();
          if (queue) {
            await queue.add(
              "process",
              { messagePayload, contactPayload, contextPayload, mediaPayload },
              { jobId: messagePayload.id }
            );
            logger.debug({
              info: "Message enqueued for processing",
              messageId: messagePayload.id
            });
          } else {
            // Fallback: process inline when Redis is not configured
            await handleMessage(
              messagePayload,
              contactPayload,
              contextPayload,
              mediaPayload
            );
          }
        } catch (err) {
          logger.error(err, "Error enqueueing message for processing");
        }
      })
    );
  });

  wbot.ev.on("connection.update", async update => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const errorMessage =
        (lastDisconnect?.error as Boom)?.output?.payload?.message ||
        (lastDisconnect?.error as Error)?.message ||
        "";

      if (errorMessage === "Intentional Logout") {
        await whatsapp.update({
          status: "DISCONNECTED",
          qrcode: "",
          retries: 0
        });

        const updatedWhatsapp = await Whatsapp.findByPk(sessionId);
        if (updatedWhatsapp) {
          io.to("notification").emit("whatsappSession", {
            action: "update",
            session: updatedWhatsapp
          });
        }

        logger.info({ info: "Session intentionally logged out", sessionId });

        await clearSessionKeys(sessionId);

        await removeSession(sessionId);
        return;
      }

      if (statusCode === DisconnectReason.loggedOut) {
        await whatsapp.update({
          status: "DISCONNECTED",
          qrcode: "",
          retries: 0
        });

        const updatedWhatsapp = await Whatsapp.findByPk(sessionId);
        if (updatedWhatsapp) {
          io.to("notification").emit("whatsappSession", {
            action: "update",
            session: updatedWhatsapp
          });
        }

        await removeSession(sessionId);

        return;
      }

      // Códigos que indicam sessão inválida — não reconectar
      const NON_RECOVERABLE = [401, 440];
      if (NON_RECOVERABLE.includes(statusCode)) {
        await whatsapp.update({
          status: "DISCONNECTED",
          qrcode: "",
          retries: 0
        });
        const updatedNR = await Whatsapp.findByPk(sessionId);
        if (updatedNR) {
          io.to("notification").emit("whatsappSession", {
            action: "update",
            session: updatedNR
          });
        }
        logger.warn({
          info: "Non-recoverable disconnect",
          sessionId,
          statusCode
        });
        reconnectingGuard.delete(sessionId);
        contactedJids.delete(sessionId);
        await removeSession(sessionId);
        return;
      }

      // Guard: evitar init() concorrente
      if (reconnectingGuard.has(sessionId)) {
        logger.info({
          info: "Already reconnecting, skipping duplicate disconnect event",
          sessionId
        });
        return;
      }

      // Backoff exponencial com limite de retries
      const currentRetries = whatsapp.retries || 0;
      const MAX_RETRIES = 10;

      if (currentRetries >= MAX_RETRIES) {
        await whatsapp.update({
          status: "DISCONNECTED",
          qrcode: "",
          retries: 0
        });
        const updatedMax = await Whatsapp.findByPk(sessionId);
        if (updatedMax) {
          io.to("notification").emit("whatsappSession", {
            action: "update",
            session: updatedMax
          });
        }
        logger.error({
          info: "Max retries reached, marking DISCONNECTED",
          sessionId,
          retries: currentRetries
        });
        reconnectingGuard.delete(sessionId);
        contactedJids.delete(sessionId);
        return;
      }

      reconnectingGuard.add(sessionId);
      const delay = Math.min(3000 * Math.pow(2, currentRetries), 60_000);

      await whatsapp.update({ status: "OPENING", retries: currentRetries + 1 });
      io.to("notification").emit("whatsappSession", {
        action: "update",
        session: whatsapp
      });

      logger.info({
        info: "Connection closed, reconnecting with backoff",
        sessionId,
        statusCode,
        retry: currentRetries + 1,
        delayMs: delay
      });

      await flushPendingCredsSave(sessionId);
      await sleep(delay);
      init(whatsapp);
    }

    if (connection === "open") {
      await flushPendingCredsSave(sessionId);

      reconnectingGuard.delete(sessionId);
      contactedJids.delete(sessionId);

      await whatsapp.update({
        status: "CONNECTED",
        qrcode: "",
        retries: 0
      });

      const updatedWhatsapp = await Whatsapp.findByPk(sessionId);
      if (updatedWhatsapp) {
        io.to("notification").emit("whatsappSession", {
          action: "update",
          session: updatedWhatsapp
        });
      }

      logger.info({ info: "Session connected", sessionId });
    }

    if (qr !== undefined) {
      await whatsapp.update({
        qrcode: qr,
        status: "qrcode"
      });

      io.to("notification").emit("whatsappSession", {
        action: "update",
        session: whatsapp
      });

      logger.info({ info: "QR Code generated", sessionId });
    }
  });

  wbot.ev.on("messages.update", async updates => {
    await Promise.all(
      updates.map(async event => {
        try {
          if (!event.update.status || !event.key.id) return;

          const ack = (event.update.status as MessageAck) || 0;
          await handleMessageAck(event.key.id, ack);
        } catch (err) {
          logger.error({
            info: "Error handling message update",
            err,
            messageId: event.key.id
          });
        }
      })
    );
  });

  wbot.ev.on("message-receipt.update", async updates => {
    await Promise.all(
      updates.map(async ({ key, receipt }) => {
        try {
          if (!key.id) return;

          let ack: MessageAck = 2;
          if (receipt.playedTimestamp) {
            ack = 4;
          } else if (receipt.readTimestamp) {
            ack = 3;
          } else if (receipt.receiptTimestamp) {
            ack = 2;
          }

          await handleMessageAck(key.id, ack);

          logger.debug({
            info: "Message receipt update processed",
            messageId: key.id,
            ack,
            sessionId
          });
        } catch (err) {
          logger.error({
            info: "Error processing message receipt",
            err,
            messageId: key.id
          });
        }
      })
    );
  });
};

const logout = async (sessionId: number): Promise<void> => {
  await flushPendingCredsSave(sessionId);

  const wbot = sessions.get(sessionId);

  if (wbot) {
    await wbot
      .logout()
      .catch(err => logger.error({ info: "Error on logout", sessionId, err }));
  }

  await removeSession(sessionId);

  const whatsapp = await Whatsapp.findByPk(sessionId);

  if (whatsapp) {
    await whatsapp.update({
      status: "DISCONNECTED",
      qrcode: "",
      session: "",
      retries: 0
    });

    const updatedWhatsapp = await Whatsapp.findByPk(sessionId);
    if (updatedWhatsapp) {
      getIO().to("notification").emit("whatsappSession", {
        action: "update",
        session: updatedWhatsapp
      });
    }

    logger.info({ info: "Session logged out", sessionId });
  }

  await clearSessionKeys(sessionId);
};

const sendMessage = async (
  sessionId: number,
  to: string,
  body: string,
  options?: SendMessageOptions
): Promise<ProviderMessage> => {
  const wbot = getWbot(sessionId);
  const toJid = normalizeJid(to);

  const messageContent: AnyMessageContent = options?.quotedMessageId
    ? {
        text: body,
        contextInfo: {
          stanzaId: options.quotedMessageId,
          participant: options.quotedMessageFromMe ? wbot.user?.id : toJid
        }
      }
    : { text: body };

  // Presence update apenas na primeira mensagem para este JID na sessão
  let jidsMsg = contactedJids.get(sessionId);
  if (!jidsMsg) {
    jidsMsg = new Set<string>();
    contactedJids.set(sessionId, jidsMsg);
  }
  if (!jidsMsg.has(toJid)) {
    await wbot.sendPresenceUpdate("composing", toJid);
    await new Promise(resolve => setTimeout(resolve, 300));
    await wbot.sendPresenceUpdate("paused", toJid);
    jidsMsg.add(toJid);
  }

  const sentMsg = await wbot.sendMessage(toJid, messageContent);

  if (!sentMsg?.key.id) {
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }

  logger.debug({
    info: "[RAW] Message sent",
    sessionId,
    to: toJid,
    key: sentMsg.key,
    messageTimestamp: sentMsg.messageTimestamp,
    status: sentMsg.status,
    rawMessage: JSON.stringify(sentMsg, null, 2)
  });

  msgCache.save(sentMsg);

  return {
    id: sentMsg.key.id,
    body,
    fromMe: true,
    hasMedia: false,
    type: "chat",
    timestamp: sentMsg.messageTimestamp
      ? Number(sentMsg.messageTimestamp)
      : Date.now(),
    from: wbot.user?.id || "",
    to,
    ack: 1
  };
};

const sendMedia = async (
  sessionId: number,
  to: string,
  media: ProviderMediaInput,
  options?: SendMediaOptions
): Promise<ProviderMessage> => {
  const wbot = getWbot(sessionId);
  const toJid = normalizeJid(to);

  // Use async read to avoid blocking the event loop during file I/O
  const mediaBuffer = media.path
    ? await fsPromises.readFile(media.path)
    : media.data;
  if (!mediaBuffer) throw new AppError("ERR_NO_MEDIA_DATA");

  const contextInfo = options?.quotedMessageId
    ? { stanzaId: options.quotedMessageId, participant: toJid }
    : undefined;

  const buildPayload = () => {
    const base = {
      caption: options?.caption,
      mimetype: media.mimetype,
      contextInfo
    };

    if (media.mimetype.startsWith("image/")) {
      return {
        message: { image: mediaBuffer, ...base },
        type: "image" as MessageType
      };
    }

    if (media.mimetype.startsWith("video/")) {
      return {
        message: { video: mediaBuffer, ...base },
        type: "video" as MessageType
      };
    }

    if (media.mimetype.startsWith("audio/")) {
      const ptt = Boolean(options?.sendAudioAsVoice);
      return {
        message: {
          audio: mediaBuffer,
          mimetype: media.mimetype,
          ptt,
          contextInfo
        },
        type: ptt ? "ptt" : ("audio" as MessageType)
      };
    }

    return {
      message: {
        document: mediaBuffer,
        caption: options?.caption,
        mimetype: media.mimetype,
        fileName: media.filename,
        contextInfo
      },
      type: "document" as MessageType
    };
  };

  const { message, type } = buildPayload();

  // Presence update apenas na primeira mensagem para este JID na sessão
  let jidsMedia = contactedJids.get(sessionId);
  if (!jidsMedia) {
    jidsMedia = new Set<string>();
    contactedJids.set(sessionId, jidsMedia);
  }
  if (!jidsMedia.has(toJid)) {
    await wbot.sendPresenceUpdate("composing", toJid);
    await new Promise(resolve => setTimeout(resolve, 300));
    await wbot.sendPresenceUpdate("paused", toJid);
    jidsMedia.add(toJid);
  }

  const sent = await wbot.sendMessage(toJid, message);
  if (!sent?.key?.id) throw new AppError("ERR_SENDING_WAPP_MEDIA_MSG");

  logger.debug({
    info: "[RAW] Media sent",
    sessionId,
    to: toJid,
    mediaType: type,
    mimetype: media.mimetype,
    filename: media.filename,
    key: sent.key,
    messageTimestamp: sent.messageTimestamp,
    status: sent.status,
    rawMessage: JSON.stringify(sent, null, 2)
  });

  msgCache.save(sent);

  return {
    id: sent.key.id,
    body: options?.caption || media.filename,
    fromMe: true,
    hasMedia: true,
    type,
    timestamp: sent.messageTimestamp
      ? Number(sent.messageTimestamp)
      : Date.now(),
    from: wbot.user?.id || "",
    to,
    ack: 1
  };
};

const deleteMessage = async (
  sessionId: number,
  chatId: string,
  messageId: string,
  fromMe: boolean
): Promise<void> => {
  const wbot = getWbot(sessionId);

  const normalizedChatId = normalizeJid(chatId);

  const key = {
    remoteJid: normalizedChatId,
    id: messageId,
    fromMe
  };

  await wbot.sendMessage(normalizedChatId, { delete: key });
};

const checkNumber = async (
  sessionId: number,
  number: string
): Promise<string> => {
  const wbot = getWbot(sessionId);

  const cleanNumber = number.replace(/\D/g, "");

  const results = await wbot.onWhatsApp(cleanNumber);
  const result = results?.[0];

  if (!result?.exists) {
    throw new AppError("ERR_NUMBER_NOT_ON_WHATSAPP", 404);
  }

  return result.jid;
};

const getProfilePicUrl = async (
  sessionId: number,
  number: string
): Promise<string> => {
  const wbot = getWbot(sessionId);

  const jid = number.includes("@") ? number : `${number}@s.whatsapp.net`;

  try {
    const url = await wbot.profilePictureUrl(jid, "image");
    return url || "";
  } catch (err) {
    logger.debug({
      info: "Could not get profile picture",
      number,
      err
    });
    return "";
  }
};

const getContacts = async (_sessionId: number): Promise<ProviderContact[]> => {
  return [];
};

const sendSeen = async (sessionId: number, chatId: string): Promise<void> => {
  const wbot = getWbot(sessionId);

  const normalizedChatId = normalizeJid(chatId);

  await wbot.readMessages([
    { remoteJid: normalizedChatId, id: "all", fromMe: false }
  ]);
};

const fetchChatMessages = async (
  _sessionId: number,
  _chatId: string,
  _limit = 100
): Promise<ProviderMessage[]> => {
  return [];
};

export const BaileysProvider: WhatsappProvider = {
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
