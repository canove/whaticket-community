import { mkdirSync, readFileSync } from "fs";
import path from "path";

import { LRUCache } from "lru-cache";
import { HttpsProxyAgent } from "https-proxy-agent";
import { createSqliteStore } from "@zapo-js/store-sqlite";
import {
  WaClient,
  createStore,
  isNewsletterJid,
  isStatusBroadcastJid,
  Logger,
  LogLevel,
  WaIncomingMessageEvent,
  WaIncomingReceiptEvent,
  WaOutgoingMessageEvent,
  WaSendMediaMessage,
  WaStore
} from "zapo-js";

import Whatsapp from "../../../models/Whatsapp";
import { getIO } from "../../../libs/socket";
import { logger } from "../../../utils/logger";
import AppError from "../../../errors/AppError";
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

type MessageContent = NonNullable<WaIncomingMessageEvent["message"]>;

const MEDIA_MESSAGE_TYPES: MessageType[] = [
  "image",
  "video",
  "audio",
  "ptt",
  "document",
  "sticker"
];

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 30_000;
const RECONNECT_MAX_ATTEMPTS = 10;

const FATAL_DISCONNECT_REASONS = [
  "stream_error_replaced",
  "stream_error_device_removed",
  "stream_error_force_logout",
  "failure_not_authorized",
  "failure_banned",
  "failure_locked",
  "failure_client_too_old",
  "failure_bad_user_agent",
  "primary_identity_key_change"
];

const sessions = new Map<number, WaClient>();
const reconnectAttemptsBySession = new Map<number, number>();
const contactsBySession = new Map<number, Map<string, ProviderContact>>();
const unreadCountByJid = new Map<string, number>();

const receivedEventsByJid = new LRUCache<string, WaIncomingMessageEvent[]>({
  max: 500,
  ttl: 30 * 60 * 1000
});

const groupSubjectByJid = new LRUCache<string, string>({
  max: 500,
  ttl: 60 * 60 * 1000
});

let store: WaStore | undefined;

const getStore = (): WaStore => {
  if (store) return store;

  const databasePath =
    process.env.ZAPO_AUTH_PATH ||
    path.resolve(__dirname, "..", "..", "..", "..", ".zapo_auth/state.sqlite");

  mkdirSync(path.dirname(databasePath), { recursive: true });

  store = createStore({
    backends: { sqlite: createSqliteStore({ path: databasePath }) },
    providers: {
      auth: "sqlite",
      signal: "sqlite",
      preKey: "sqlite",
      session: "sqlite",
      identity: "sqlite",
      senderKey: "sqlite",
      appState: "sqlite",
      privacyToken: "sqlite",
      messages: "sqlite",
      threads: "sqlite",
      contacts: "sqlite"
    }
  });

  return store;
};

const buildZapoLogger = (
  level: LogLevel,
  bindings: Record<string, unknown>
): Logger => {
  const forward =
    (emit: (payload: Record<string, unknown>) => void) =>
    (message: string, context?: Readonly<Record<string, unknown>>) =>
      emit({ info: message, ...bindings, ...context });

  return {
    level,
    trace: forward(payload => logger.trace(payload)),
    debug: forward(payload => logger.debug(payload)),
    info: forward(payload => logger.info(payload)),
    warn: forward(payload => logger.warn(payload)),
    error: forward(payload => logger.error(payload)),
    child: (childBindings, options) =>
      buildZapoLogger(options?.level || level, {
        ...bindings,
        ...childBindings
      })
  };
};

const extractNumber = (jid?: string | null): string =>
  jid?.split("@")[0]?.split(":")[0] || "";

const toDestinationJid = (chatId: string): string => {
  if (chatId.endsWith("@lid")) return chatId;
  if (chatId.endsWith("@s.whatsapp.net")) return chatId;

  const number = extractNumber(chatId);

  if (chatId.endsWith("@g.us") || chatId.endsWith("@g")) {
    return `${number}@g.us`;
  }

  return `${number}@s.whatsapp.net`;
};

const splitAddressing = (primaryJid: string, alternateJid?: string) => {
  const candidates = [primaryJid, alternateJid].filter(
    (jid): jid is string => !!jid
  );

  return {
    phoneJid: candidates.find(jid => jid.endsWith("@s.whatsapp.net")),
    lidJid: candidates.find(jid => jid.endsWith("@lid"))
  };
};

const unwrapContent = (message: MessageContent): MessageContent => {
  let content = message;

  for (;;) {
    const inner =
      content.ephemeralMessage?.message ||
      content.viewOnceMessage?.message ||
      content.viewOnceMessageV2?.message ||
      content.viewOnceMessageV2Extension?.message ||
      content.documentWithCaptionMessage?.message ||
      content.deviceSentMessage?.message ||
      content.groupMentionedMessage?.message;

    if (!inner) return content;

    content = inner;
  }
};

const resolveMessageType = (
  content: MessageContent
): MessageType | undefined => {
  if (content.conversation || content.extendedTextMessage) return "chat";
  if (content.buttonsResponseMessage || content.listResponseMessage) {
    return "chat";
  }
  if (content.imageMessage) return "image";
  if (content.videoMessage || content.ptvMessage) return "video";
  if (content.audioMessage) {
    return content.audioMessage.ptt ? "ptt" : "audio";
  }
  if (content.documentMessage) return "document";
  if (content.stickerMessage) return "sticker";
  if (content.locationMessage) return "location";
  if (content.contactMessage || content.contactsArrayMessage) return "vcard";

  return undefined;
};

const getMessageBody = (content: MessageContent): string => {
  if (content.locationMessage) {
    const { degreesLatitude, degreesLongitude, name } = content.locationMessage;
    const gmapsUrl = `https://maps.google.com/maps?q=${degreesLatitude}%2C${degreesLongitude}&z=17&hl=pt-BR`;

    return `${gmapsUrl}|${name || `${degreesLatitude}, ${degreesLongitude}`}`;
  }

  if (content.contactMessage) return content.contactMessage.vcard || "";

  if (content.contactsArrayMessage) {
    return (content.contactsArrayMessage.contacts || [])
      .map(contact => contact.vcard)
      .join("\n");
  }

  return (
    content.conversation ||
    content.extendedTextMessage?.text ||
    content.buttonsResponseMessage?.selectedDisplayText ||
    content.listResponseMessage?.title ||
    content.imageMessage?.caption ||
    content.videoMessage?.caption ||
    content.documentMessage?.caption ||
    ""
  );
};

const getQuotedMessageId = (content: MessageContent): string | undefined => {
  const contextInfo =
    content.extendedTextMessage?.contextInfo ||
    content.imageMessage?.contextInfo ||
    content.videoMessage?.contextInfo ||
    content.audioMessage?.contextInfo ||
    content.documentMessage?.contextInfo ||
    content.stickerMessage?.contextInfo;

  return contextInfo?.stanzaId || undefined;
};

const extensionFromMimetype = (mimetype: string, fallback: string): string =>
  mimetype.split("/")[1]?.split(";")[0] || fallback;

const resolveMediaMetadata = (
  content: MessageContent
): { filename: string; mimetype: string } | undefined => {
  if (content.imageMessage) {
    const mimetype = content.imageMessage.mimetype || "image/jpeg";
    const extension = extensionFromMimetype(mimetype, "jpg");

    return { filename: `image-${Date.now()}.${extension}`, mimetype };
  }

  const video = content.videoMessage || content.ptvMessage;
  if (video) {
    const mimetype = video.mimetype || "video/mp4";
    const extension = extensionFromMimetype(mimetype, "mp4");

    return { filename: `video-${Date.now()}.${extension}`, mimetype };
  }

  if (content.audioMessage) {
    return {
      filename: `audio-${Date.now()}.ogg`,
      mimetype: content.audioMessage.mimetype || "audio/ogg; codecs=opus"
    };
  }

  if (content.documentMessage) {
    const mimetype =
      content.documentMessage.mimetype || "application/octet-stream";
    const extension = extensionFromMimetype(mimetype, "bin");

    return {
      filename:
        content.documentMessage.fileName ||
        content.documentMessage.title ||
        `document-${Date.now()}.${extension}`,
      mimetype
    };
  }

  if (content.stickerMessage) {
    return {
      filename: `sticker-${Date.now()}.webp`,
      mimetype: content.stickerMessage.mimetype || "image/webp"
    };
  }

  return undefined;
};

const convertToMediaPayload = async (
  source: WaIncomingMessageEvent | MessageContent,
  client: WaClient,
  content: MessageContent,
  messageId: string
): Promise<MediaPayload | undefined> => {
  const metadata = resolveMediaMetadata(content);
  if (!metadata) return undefined;

  try {
    const bytes = await client.message.downloadBytes(source);

    return {
      filename: metadata.filename,
      mimetype: metadata.mimetype,
      data: Buffer.from(bytes).toString("base64")
    };
  } catch (err) {
    logger.error({ info: "Error downloading media", err, messageId });

    return undefined;
  }
};

const getProfilePicUrlByJid = async (
  client: WaClient,
  jid: string
): Promise<string | undefined> => {
  const result = await client.profile.getProfilePicture(jid).catch(() => {
    return undefined;
  });

  return result?.url || undefined;
};

const getGroupSubject = async (
  client: WaClient,
  groupJid: string
): Promise<string | undefined> => {
  const cached = groupSubjectByJid.get(groupJid);
  if (cached) return cached;

  const metadata = await client.group
    .queryGroupMetadata(groupJid)
    .catch(() => undefined);

  if (metadata?.subject) groupSubjectByJid.set(groupJid, metadata.subject);

  return metadata?.subject;
};

const rememberContact = (sessionId: number, contact: ContactPayload): void => {
  if (contact.isGroup || !contact.number) return;

  const knownContacts = contactsBySession.get(sessionId) || new Map();

  knownContacts.set(contact.number, {
    id: `${contact.number}@s.whatsapp.net`,
    number: contact.number,
    name: contact.name,
    pushname: contact.name,
    isGroup: false
  });

  contactsBySession.set(sessionId, knownContacts);
};

const rememberReceivedEvent = (event: WaIncomingMessageEvent): void => {
  const jid = event.key.remoteJid;
  if (!jid || event.key.fromMe) return;

  const events = receivedEventsByJid.get(jid) || [];

  receivedEventsByJid.set(jid, [...events, event].slice(-20));
  unreadCountByJid.set(jid, (unreadCountByJid.get(jid) || 0) + 1);
};

const buildContactPayload = async (
  client: WaClient,
  primaryJid: string,
  alternateJid: string | undefined,
  pushName: string | undefined
): Promise<ContactPayload> => {
  const { phoneJid, lidJid } = splitAddressing(primaryJid, alternateJid);
  const jid = phoneJid || lidJid || primaryJid;
  const number = extractNumber(jid);

  return {
    name: pushName || number,
    number,
    lid: lidJid ? `${extractNumber(lidJid)}@lid` : undefined,
    profilePicUrl: await getProfilePicUrlByJid(client, jid),
    isGroup: false
  };
};

const buildGroupContactPayload = async (
  client: WaClient,
  groupJid: string
): Promise<ContactPayload> => {
  const number = extractNumber(groupJid);

  return {
    name: (await getGroupSubject(client, groupJid)) || number,
    number,
    isGroup: true,
    profilePicUrl: await getProfilePicUrlByJid(client, groupJid)
  };
};

const buildMessagePayload = (
  event: WaIncomingMessageEvent,
  content: MessageContent,
  type: MessageType
): MessagePayload => {
  const { key } = event;
  const remoteJid = key.remoteJid || "";
  const quotedMsgId = getQuotedMessageId(content);

  return {
    id: key.id || "",
    body: getMessageBody(content),
    fromMe: !!key.fromMe,
    hasMedia: MEDIA_MESSAGE_TYPES.includes(type),
    type,
    timestamp: event.timestampSeconds || Math.floor(Date.now() / 1000),
    from: remoteJid,
    to: key.fromMe ? remoteJid : key.participant || remoteJid,
    hasQuotedMsg: !!quotedMsgId,
    quotedMsgId,
    ack: key.fromMe ? 1 : 0
  };
};

const dispatchIncomingMessage = async (
  event: WaIncomingMessageEvent,
  client: WaClient,
  sessionId: number
): Promise<void> => {
  if (!event.message || !event.key.id) return;

  const content = unwrapContent(event.message);
  const type = resolveMessageType(content);
  if (!type) return;

  const { key } = event;
  const remoteJid = key.remoteJid || "";

  const contactPayload = await buildContactPayload(
    client,
    key.isGroup ? key.participant || remoteJid : remoteJid,
    key.isGroup ? key.participantAlt : key.remoteJidAlt,
    event.pushName
  );

  const groupContact = key.isGroup
    ? await buildGroupContactPayload(client, remoteJid)
    : undefined;

  const messagePayload = buildMessagePayload(event, content, type);

  const mediaPayload = messagePayload.hasMedia
    ? await convertToMediaPayload(event, client, content, key.id)
    : undefined;

  rememberContact(sessionId, contactPayload);
  rememberReceivedEvent(event);

  const contextPayload: WhatsappContextPayload = {
    whatsappId: sessionId,
    unreadMessages: key.fromMe ? 0 : unreadCountByJid.get(remoteJid) || 1,
    groupContact
  };

  await handleMessage(
    messagePayload,
    contactPayload,
    contextPayload,
    mediaPayload
  );
};

const dispatchOutgoingMessage = async (
  event: WaOutgoingMessageEvent,
  client: WaClient,
  sessionId: number
): Promise<void> => {
  if (!event.id) return;

  const content = unwrapContent(event.message);
  const type = resolveMessageType(content);
  if (!type) return;

  const isGroup = event.to.endsWith("@g.us");

  const contactPayload = isGroup
    ? await buildGroupContactPayload(client, event.to)
    : await buildContactPayload(client, event.to, undefined, undefined);

  const quotedMsgId = getQuotedMessageId(content);
  const hasMedia = MEDIA_MESSAGE_TYPES.includes(type);

  const messagePayload: MessagePayload = {
    id: event.id,
    body: getMessageBody(content),
    fromMe: true,
    hasMedia,
    type,
    timestamp: Math.floor(Date.now() / 1000),
    from: client.getCredentials()?.meJid || "",
    to: event.to,
    hasQuotedMsg: !!quotedMsgId,
    quotedMsgId,
    ack: 1
  };

  const mediaPayload = hasMedia
    ? await convertToMediaPayload(content, client, content, event.id)
    : undefined;

  const contextPayload: WhatsappContextPayload = {
    whatsappId: sessionId,
    unreadMessages: 0,
    groupContact: isGroup ? contactPayload : undefined
  };

  await handleMessage(
    messagePayload,
    contactPayload,
    contextPayload,
    mediaPayload
  );
};

const ackByReceiptStatus: Record<string, MessageAck> = {
  delivered: 2,
  read: 3,
  played: 4
};

const dispatchReceipt = async (
  event: WaIncomingReceiptEvent
): Promise<void> => {
  const ack = ackByReceiptStatus[event.status];
  if (ack === undefined || event.fromSelfDevice) return;

  await Promise.all(
    event.messageIds.map(async messageId => {
      try {
        await handleMessageAck(messageId, ack);
      } catch (err) {
        logger.error({ info: "Error handling receipt", err, messageId });
      }
    })
  );
};

const emitSession = async (sessionId: number): Promise<void> => {
  const updatedWhatsapp = await Whatsapp.findByPk(sessionId);
  if (!updatedWhatsapp) return;

  getIO().emit("whatsappSession", {
    action: "update",
    session: updatedWhatsapp
  });
};

const getWbot = (sessionId: number): WaClient => {
  const client = sessions.get(sessionId);

  if (!client) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }

  return client;
};

const removeSession = async (whatsappId: number): Promise<void> => {
  const client = sessions.get(whatsappId);
  if (!client) return;

  sessions.delete(whatsappId);
  contactsBySession.delete(whatsappId);
  reconnectAttemptsBySession.delete(whatsappId);
  client.removeAllListeners();

  await client.disconnect().catch(err => {
    logger.error({
      info: "Error disconnecting session",
      err,
      sessionId: whatsappId
    });
  });
};

const buildMediaOptions = () => {
  try {
    /* eslint-disable-next-line global-require, import/no-unresolved, import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
    const { createMediaProcessor } = require("@zapo-js/media-utils");

    return {
      processor: createMediaProcessor(),
      generateThumbnail: true,
      generateWaveform: true,
      normalizeVoiceNote: true
    };
  } catch {
    return undefined;
  }
};

const buildProxyOptions = () => {
  const proxyAddress = process.env.PROXY_ADDRESS;
  if (!proxyAddress) return undefined;

  const proxyAuth = process.env.PROXY_AUTH;
  const proxyUrl = proxyAuth
    ? `http://${proxyAuth}@${proxyAddress}`
    : `http://${proxyAddress}`;

  return { ws: new HttpsProxyAgent(proxyUrl) };
};

const init = async (whatsapp: Whatsapp): Promise<void> => {
  const sessionId = whatsapp.id;

  await removeSession(sessionId);

  const proxy = buildProxyOptions();
  const media = buildMediaOptions();

  const client = new WaClient(
    {
      store: getStore(),
      sessionId: String(sessionId),
      connectTimeoutMs: 25_000,
      recoverFromClientTooOld: true,
      history: { enabled: false, requireFullSync: false },
      ...(media ? { media } : {}),
      ...(proxy ? { proxy } : {})
    },
    buildZapoLogger((process.env.ZAPO_LOG_LEVEL as LogLevel) || "error", {
      sessionId
    })
  );

  sessions.set(sessionId, client);

  client.ignoreKey(ctx => {
    const jid = ctx.remoteJid || "";

    return isStatusBroadcastJid(jid) || isNewsletterJid(jid);
  });

  client.on("auth_qr", async ({ qr }) => {
    await whatsapp.update({ qrcode: qr, status: "qrcode" });
    await emitSession(sessionId);

    logger.info({ info: "QR Code generated", sessionId });
  });

  client.on("connection", async event => {
    if (event.status === "open") {
      reconnectAttemptsBySession.set(sessionId, 0);

      await whatsapp.update({ status: "CONNECTED", qrcode: "", retries: 0 });
      await emitSession(sessionId);

      logger.info({ info: "Session connected", sessionId });
      return;
    }

    const isFatal =
      event.isLogout || FATAL_DISCONNECT_REASONS.includes(event.reason);

    if (isFatal) {
      await whatsapp.update({
        status: "DISCONNECTED",
        qrcode: "",
        session: "",
        retries: 0
      });
      await emitSession(sessionId);
      await removeSession(sessionId);

      logger.info({
        info: "Session disconnected, re-pairing required",
        sessionId,
        reason: event.reason,
        code: event.code
      });
      return;
    }

    if (sessions.get(sessionId) !== client) return;

    const attempt = (reconnectAttemptsBySession.get(sessionId) || 0) + 1;

    if (attempt > RECONNECT_MAX_ATTEMPTS) {
      await whatsapp.update({ status: "DISCONNECTED", qrcode: "" });
      await emitSession(sessionId);
      await removeSession(sessionId);

      logger.error({
        info: "Giving up on reconnecting session",
        sessionId,
        attempts: attempt - 1,
        reason: event.reason
      });
      return;
    }

    reconnectAttemptsBySession.set(sessionId, attempt);

    await whatsapp.update({ status: "OPENING" });
    await emitSession(sessionId);

    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * 2 ** (attempt - 1),
      RECONNECT_MAX_DELAY_MS
    );

    logger.info({
      info: "Connection closed, reconnecting...",
      sessionId,
      reason: event.reason,
      attempt,
      delay
    });

    await sleep(delay);

    client.connect().catch(err => {
      logger.error({ info: "Error reconnecting session", err, sessionId });
    });
  });

  client.on("message", event => {
    dispatchIncomingMessage(event, client, sessionId).catch(err => {
      logger.error({ info: "Error handling incoming message", err, sessionId });
    });
  });

  client.on("message_send", event => {
    dispatchOutgoingMessage(event, client, sessionId).catch(err => {
      logger.error({ info: "Error handling sent message", err, sessionId });
    });
  });

  client.on("receipt", event => {
    dispatchReceipt(event).catch(err => {
      logger.error({ info: "Error handling receipt", err, sessionId });
    });
  });

  await client.connect();
};

const logout = async (sessionId: number): Promise<void> => {
  const client = sessions.get(sessionId);

  if (client) {
    await client.logout().catch(err => {
      logger.error({ info: "Error on logout", err, sessionId });
    });
  }

  await removeSession(sessionId);

  const whatsapp = await Whatsapp.findByPk(sessionId);
  if (!whatsapp) return;

  await whatsapp.update({
    status: "DISCONNECTED",
    qrcode: "",
    session: "",
    retries: 0
  });
  await emitSession(sessionId);

  logger.info({ info: "Session logged out", sessionId });
};

const buildQuote = (
  client: WaClient,
  toJid: string,
  options?: SendMessageOptions | SendMediaOptions
) => {
  if (!options?.quotedMessageId) return undefined;

  const fromMe =
    "quotedMessageFromMe" in options ? !!options.quotedMessageFromMe : false;

  return {
    remoteJid: toJid,
    id: options.quotedMessageId,
    fromMe,
    participant: fromMe ? client.getCredentials()?.meJid : toJid
  };
};

const sendMessage = async (
  sessionId: number,
  to: string,
  body: string,
  options?: SendMessageOptions
): Promise<ProviderMessage> => {
  const client = getWbot(sessionId);
  const toJid = toDestinationJid(to);

  const result = await client.message.send(toJid, body, {
    quote: buildQuote(client, toJid, options)
  });

  if (!result?.id) {
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }

  return {
    id: result.id,
    body,
    fromMe: true,
    hasMedia: false,
    type: "chat",
    timestamp: Math.floor(Date.now() / 1000),
    from: client.getCredentials()?.meJid || "",
    to,
    ack: 1
  };
};

const mediaTypeByMimetype = (
  mimetype: string,
  sendAsDocument: boolean
): "image" | "video" | "audio" | "document" => {
  if (sendAsDocument) return "document";
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";

  return "document";
};

const sendMedia = async (
  sessionId: number,
  to: string,
  media: ProviderMediaInput,
  options?: SendMediaOptions
): Promise<ProviderMessage> => {
  const client = getWbot(sessionId);
  const toJid = toDestinationJid(to);

  const mediaBuffer = media.path ? readFileSync(media.path) : media.data;
  if (!mediaBuffer) throw new AppError("ERR_NO_MEDIA_DATA");

  const mediaType = mediaTypeByMimetype(
    media.mimetype,
    !!options?.sendMediaAsDocument
  );

  const isVoice = mediaType === "audio" && !!options?.sendAudioAsVoice;

  const content = {
    type: mediaType,
    media: mediaBuffer,
    mimetype: media.mimetype,
    ...(options?.caption ? { caption: options.caption } : {}),
    ...(mediaType === "document" ? { fileName: media.filename } : {}),
    ...(isVoice ? { ptt: true } : {})
  } as WaSendMediaMessage;

  const result = await client.message.send(toJid, content, {
    quote: buildQuote(client, toJid, options)
  });

  if (!result?.id) {
    throw new AppError("ERR_SENDING_WAPP_MEDIA_MSG");
  }

  return {
    id: result.id,
    body: options?.caption || media.filename,
    fromMe: true,
    hasMedia: true,
    type: isVoice ? "ptt" : (mediaType as MessageType),
    timestamp: Math.floor(Date.now() / 1000),
    from: client.getCredentials()?.meJid || "",
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
  const client = getWbot(sessionId);
  const remoteJid = toDestinationJid(chatId);

  await client.message.send(remoteJid, {
    type: "revoke",
    target: { remoteJid, id: messageId, fromMe }
  });
};

const checkNumber = async (
  sessionId: number,
  number: string
): Promise<string> => {
  const client = getWbot(sessionId);

  const [result] = await client.profile.getLidsByPhoneNumbers([
    number.replace(/\D/g, "")
  ]);

  if (!result?.exists) {
    throw new AppError("ERR_NUMBER_NOT_ON_WHATSAPP", 404);
  }

  return result.phoneJid;
};

const getProfilePicUrl = async (
  sessionId: number,
  number: string
): Promise<string> => {
  const client = getWbot(sessionId);

  const url = await getProfilePicUrlByJid(client, toDestinationJid(number));

  return url || "";
};

const getContacts = async (sessionId: number): Promise<ProviderContact[]> => {
  getWbot(sessionId);

  const knownContacts = contactsBySession.get(sessionId);

  return knownContacts ? Array.from(knownContacts.values()) : [];
};

const sendSeen = async (sessionId: number, chatId: string): Promise<void> => {
  const client = getWbot(sessionId);
  const remoteJid = toDestinationJid(chatId);

  const events = receivedEventsByJid.get(remoteJid);

  unreadCountByJid.set(remoteJid, 0);

  if (!events?.length) return;

  await client.message.sendReceipt(events, { type: "read" });

  receivedEventsByJid.delete(remoteJid);
};

const fetchChatMessages = async (
  sessionId: number,
  chatId: string,
  limit = 100
): Promise<ProviderMessage[]> => {
  getWbot(sessionId);

  const remoteJid = toDestinationJid(chatId);
  const events = receivedEventsByJid.get(remoteJid) || [];

  return events.slice(-limit).reduce<ProviderMessage[]>((messages, event) => {
    if (!event.message) return messages;

    const content = unwrapContent(event.message);
    const type = resolveMessageType(content);
    if (!type) return messages;

    return [...messages, buildMessagePayload(event, content, type)];
  }, []);
};

export const ZapoProvider: WhatsappProvider = {
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
