import qrCode from "qrcode-terminal";
import {
  Client,
  LocalAuth,
  MessageMedia,
  Message as WbotMessage,
  Contact as WbotContact,
  MessageSendOptions
} from "whatsapp-web.js";
import { getIO } from "../../../libs/socket";
import Whatsapp from "../../../models/Whatsapp";
import AppError from "../../../errors/AppError";
import { logger } from "../../../utils/logger";
import { WhatsappProvider } from "../whatsappProvider";
import {
  ProviderMessage,
  ProviderMediaInput,
  SendMessageOptions,
  SendMediaOptions,
  MessageType,
  MessageAck,
  ProviderContact
} from "../types";
import {
  handleMessage,
  handleMessageAck,
  ContactPayload,
  MessagePayload,
  MediaPayload,
  WhatsappContextPayload
} from "../../../handlers/handleWhatsappEvents";

interface Session extends Client {
  id?: number;
}

const sessions: Session[] = [];

const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

const mapMessageType = (wbotType: any): MessageType => {
  const typeMap: Record<string, MessageType> = {
    chat: "chat",
    audio: "audio",
    ptt: "ptt",
    video: "video",
    image: "image",
    document: "document",
    vcard: "vcard",
    sticker: "sticker",
    location: "location"
  };
  return typeMap[wbotType] || "chat";
};

const mapMessageAck = (wbotAck: any): MessageAck => {
  const ackMap: Record<number, MessageAck> = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4
  };
  return ackMap[wbotAck] || 0;
};

const convertToProviderMessage = (
  wbotMessage: WbotMessage
): ProviderMessage => {
  return {
    id: wbotMessage.id.id,
    body: wbotMessage.body,
    fromMe: wbotMessage.fromMe,
    hasMedia: wbotMessage.hasMedia,
    type: mapMessageType(wbotMessage.type),
    timestamp: wbotMessage.timestamp,
    from: wbotMessage.from,
    to: wbotMessage.to,
    hasQuotedMsg: wbotMessage.hasQuotedMsg,
    ack: mapMessageAck(wbotMessage.ack)
  };
};

const getSerializedMessageId = (
  chatId: string,
  fromMe: boolean,
  messageId: string
): string => {
  const serializedMsgId = `${fromMe}_${chatId}_${messageId}`;

  return serializedMsgId;
};

const convertToContactPayload = async (
  msgContact: WbotContact
): Promise<ContactPayload> => {
  const profilePicUrl = await msgContact.getProfilePicUrl();

  return {
    name: msgContact.name || msgContact.pushname || msgContact.id.user,
    number: msgContact.id.user,
    profilePicUrl,
    isGroup: msgContact.isGroup
  };
};

const verifyQuotedMessage = async (
  msg: WbotMessage
): Promise<string | undefined> => {
  if (!msg.hasQuotedMsg) return undefined;

  const wbotQuotedMsg = await msg.getQuotedMessage();
  return wbotQuotedMsg.id.id;
};

const prepareLocation = (msg: WbotMessage): WbotMessage => {
  const { location } = msg as any;
  const gmapsUrl = `https://maps.google.com/maps?q=${location.latitude}%2C${location.longitude}&z=17&hl=pt-BR`;

  msg.body = `data:image/png;base64,${msg.body}|${gmapsUrl}`;
  msg.body += `|${
    location.description
      ? location.description
      : `${location.latitude}, ${location.longitude}`
  }`;

  return msg;
};

const convertToMessagePayload = async (
  msg: WbotMessage
): Promise<MessagePayload> => {
  let processedMsg = msg;
  if (msg.type === "location") {
    processedMsg = prepareLocation(msg);
  }

  const quotedMsgId = await verifyQuotedMessage(processedMsg);

  return {
    id: processedMsg.id.id,
    body: processedMsg.body,
    fromMe: processedMsg.fromMe,
    hasMedia: processedMsg.hasMedia,
    type: mapMessageType(processedMsg.type),
    timestamp: processedMsg.timestamp,
    from: processedMsg.from,
    to: processedMsg.to,
    hasQuotedMsg: processedMsg.hasQuotedMsg,
    quotedMsgId
  };
};

const convertToMediaPayload = async (
  msg: WbotMessage
): Promise<MediaPayload | undefined> => {
  if (!msg.hasMedia) return undefined;

  const media = await msg.downloadMedia();
  if (!media) return undefined;

  return {
    filename: media.filename || "",
    mimetype: media.mimetype,
    data: media.data
  };
};

const shouldHandleMessage = (msg: WbotMessage): boolean => {
  if (msg.from === "status@broadcast") return false;

  if (
    !(
      msg.type === "chat" ||
      msg.type === "audio" ||
      msg.type === "ptt" ||
      msg.type === "video" ||
      msg.type === "image" ||
      msg.type === "document" ||
      msg.type === "vcard" ||
      msg.type === "sticker" ||
      msg.type === "location"
    )
  ) {
    return false;
  }

  // Check for Unicode direction mark
  if (/\u200e/.test(msg.body[0])) return false;

  // Additional validation for messages from me
  if (msg.fromMe) {
    if (
      !msg.hasMedia &&
      msg.type !== "location" &&
      msg.type !== "chat" &&
      msg.type !== "vcard"
    ) {
      return false;
    }
  }

  return true;
};

const getMessageData = async (
  msg: WbotMessage,
  wbot: Session
): Promise<{
  messagePayload: MessagePayload;
  contactPayload: ContactPayload;
  contextPayload: WhatsappContextPayload;
  mediaPayload: MediaPayload | undefined;
}> => {
  let msgContact: WbotContact;
  let groupContact: ContactPayload | undefined;

  if (msg.fromMe) {
    msgContact = await wbot.getContactById(msg.to);
  } else {
    msgContact = await msg.getContact();
  }

  const chat = await msg.getChat();

  if (chat.isGroup) {
    let msgGroupContact;

    if (msg.fromMe) {
      msgGroupContact = await wbot.getContactById(msg.to);
    } else {
      msgGroupContact = await wbot.getContactById(msg.from);
    }

    groupContact = await convertToContactPayload(msgGroupContact);
  }

  const unreadMessages = msg.fromMe ? 0 : chat.unreadCount;

  const contactPayload = await convertToContactPayload(msgContact);
  const messagePayload = await convertToMessagePayload(msg);
  const mediaPayload = await convertToMediaPayload(msg);

  const contextPayload: WhatsappContextPayload = {
    whatsappId: wbot.id!,
    unreadMessages,
    groupContact
  };

  return {
    messagePayload,
    contactPayload,
    contextPayload,
    mediaPayload
  };
};

const syncUnreadMessages = async (wbot: Session) => {
  try {
    const chats = await wbot.getChats();

    /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-await-in-loop */
    for (const chat of chats) {
      if (chat.unreadCount > 0) {
        const unreadMessages = await chat.fetchMessages({
          limit: chat.unreadCount
        });

        for (const msg of unreadMessages) {
          if (shouldHandleMessage(msg)) {
            const {
              messagePayload,
              contactPayload,
              contextPayload,
              mediaPayload
            } = await getMessageData(msg, wbot);

            handleMessage(
              messagePayload,
              contactPayload,
              contextPayload,
              mediaPayload
            );
          }
        }

        await chat.sendSeen();
      }
    }
  } catch (err) {
    logger.error(err, "Error syncing unread messages");
  }
};

const removeSession = (whatsappId: number): void => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].destroy();
      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};

const sendMessage = async (
  sessionId: number,
  to: string,
  body: string,
  options?: SendMessageOptions
): Promise<ProviderMessage> => {
  const wbot = getWbot(sessionId);

  const quotedMsgSerializedId = options?.quotedMessageId
    ? getSerializedMessageId(
        to,
        Boolean(options?.quotedMessageFromMe),
        options?.quotedMessageId
      )
    : "";

  const sentMessage = await wbot.sendMessage(to, body, {
    quotedMessageId: quotedMsgSerializedId,
    linkPreview: options?.linkPreview
  });

  return convertToProviderMessage(sentMessage);
};

const sendMedia = async (
  sessionId: number,
  to: string,
  media: ProviderMediaInput,
  options?: SendMediaOptions
): Promise<ProviderMessage> => {
  const wbot = getWbot(sessionId);

  const messageMedia = media.path
    ? MessageMedia.fromFilePath(media.path)
    : new MessageMedia(
        media.mimetype,
        media.data?.toString("base64") || "",
        media.filename
      );

  const mediaOptions: MessageSendOptions = {
    caption: options?.caption,
    sendAudioAsVoice: options?.sendAudioAsVoice,
    quotedMessageId: options?.quotedMessageId
  };

  if (
    messageMedia.mimetype.startsWith("image/") &&
    !/^.*\.(jpe?g|png|gif)?$/i.exec(media.filename)
  ) {
    mediaOptions.sendMediaAsDocument = options?.sendMediaAsDocument || true;
  }

  const sentMessage = await wbot.sendMessage(to, messageMedia, mediaOptions);
  return convertToProviderMessage(sentMessage);
};

const checkNumber = async (
  sessionId: number,
  number: string
): Promise<string> => {
  const wbot = getWbot(sessionId);
  const validNumber = await wbot.getNumberId(`${number}@c.us`);

  return validNumber?.user || "";
};

const getProfilePicUrl = async (
  sessionId: number,
  number: string
): Promise<string> => {
  const wbot = getWbot(sessionId);
  const profilePicUrl = await wbot.getProfilePicUrl(`${number}@c.us`);
  return profilePicUrl;
};

const sendSeen = async (sessionId: number, chatId: string): Promise<void> => {
  const wbot = getWbot(sessionId);
  const chat = await wbot.getChatById(chatId);
  await chat.sendSeen();
};

const fetchChatMessages = async (
  sessionId: number,
  chatId: string,
  limit = 100
): Promise<ProviderMessage[]> => {
  const wbot = getWbot(sessionId);
  const chat = await wbot.getChatById(chatId);
  const messages = await chat.fetchMessages({ limit });

  return messages.map(convertToProviderMessage);
};

const getContacts = async (sessionId: number): Promise<ProviderContact[]> => {
  const wbot = getWbot(sessionId);
  const contacts = await wbot.getContacts();

  return contacts.map(contact => ({
    id: contact.id.user,
    name: contact.name || contact.pushname,
    pushname: contact.pushname,
    number: contact.id.user,
    profilePicUrl: undefined,
    isGroup: contact.isGroup
  }));
};

const logout = async (sessionId: number): Promise<void> => {
  const wbot = getWbot(sessionId);
  await wbot.logout();
};

const deleteMessage = async (
  sessionId: number,
  chatId: string,
  messageId: string,
  fromMe: boolean
): Promise<void> => {
  const wbot = getWbot(sessionId);

  const serializedMsgId = getSerializedMessageId(chatId, fromMe, messageId);

  const message = await wbot.getMessageById(serializedMsgId);

  await message.delete(true);
};

const init = async (whatsapp: Whatsapp): Promise<void> => {
  try {
    removeSession(whatsapp.id);

    const io = getIO();
    const sessionName = whatsapp.name;

    const args: string = process.env.CHROME_ARGS || "";

    const wbot: Session = new Client({
      authStrategy: new LocalAuth({ clientId: `bd_${whatsapp.id}` }),
      puppeteer: {
        // headless: false, // TODO make sure chromium closes on session disconnection / delete
        executablePath: process.env.CHROME_BIN || undefined,
        browserWSEndpoint: process.env.CHROME_WS || undefined,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          ...args.split(" ")
        ]
      }
    });

    wbot.on("qr", async qr => {
      logger.info("Session:", sessionName);
      qrCode.generate(qr, { small: true });
      await whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });

      const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
      if (sessionIndex === -1) {
        wbot.id = whatsapp.id;
        sessions.push(wbot);
      }

      io.emit("whatsappSession", {
        action: "update",
        session: whatsapp
      });
    });

    wbot.on("authenticated", async () => {
      logger.info(`Session: ${sessionName} AUTHENTICATED`);
    });

    wbot.on("auth_failure", async msg => {
      console.error(
        `Session: ${sessionName} AUTHENTICATION FAILURE! Reason: ${msg}`
      );

      if (whatsapp.retries > 1) {
        await whatsapp.update({ session: "", retries: 0 });
      }

      await whatsapp.update({
        status: "DISCONNECTED",
        retries: whatsapp.retries + 1
      });

      io.emit("whatsappSession", {
        action: "update",
        session: whatsapp
      });
    });

    wbot.on("ready", async () => {
      logger.info(`Session: ${sessionName} READY`);

      try {
        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          retries: 0
        });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        wbot.sendPresenceAvailable();
        await syncUnreadMessages(wbot);
      } catch (err) {
        logger.error(err, "Error on whatsapp ready event");
      }
    });

    wbot.on("change_state", async newState => {
      logger.info(`Monitor session: ${sessionName}, ${newState}`);
      try {
        await whatsapp.update({ status: newState });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });
      } catch (err) {
        logger.error(err, "Error on whatsapp change state event");
      }
    });

    wbot.on("disconnected", async reason => {
      logger.info(`Disconnected session: ${sessionName}, reason: ${reason}`);
      try {
        await whatsapp.update({ status: "OPENING", session: "" });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        logger.warn(
          `Session ${sessionName} disconnected. Restarting in 2 seconds...`
        );

        await new Promise(r => setTimeout(r, 2000));

        init(whatsapp);
      } catch (err) {
        logger.error(err, "Error on whatsapp disconnected event");
      }
    });

    wbot.on("message_create", async msg => {
      if (!shouldHandleMessage(msg)) return;

      try {
        const { messagePayload, contactPayload, contextPayload, mediaPayload } =
          await getMessageData(msg, wbot);

        await handleMessage(
          messagePayload,
          contactPayload,
          contextPayload,
          mediaPayload
        );
      } catch (err) {
        logger.error(err, "Error on whatsapp message create event");
      }
    });

    wbot.on("media_uploaded", async msg => {
      if (!shouldHandleMessage(msg)) return;

      try {
        const { messagePayload, contactPayload, contextPayload, mediaPayload } =
          await getMessageData(msg, wbot);

        await handleMessage(
          messagePayload,
          contactPayload,
          contextPayload,
          mediaPayload
        );
      } catch (err) {
        logger.error(err, "Error on whatsapp media uploaded event");
      }
    });

    wbot.on("message_ack", async (msg, ack) => {
      handleMessageAck(msg.id.id, mapMessageAck(ack));
    });

    await wbot.initialize();
  } catch (err) {
    logger.error(err, "Error on whatsapp session");
  }
};

export const WhatsappWebJsProvider: WhatsappProvider = {
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
