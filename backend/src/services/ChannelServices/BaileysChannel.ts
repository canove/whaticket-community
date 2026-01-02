import makeWASocket, {
  DisconnectReason,
  WASocket,
  makeCacheableSignalKeyStore,
  WAMessage,
  Contact,
  BaileysEventMap,
  isJidGroup
} from "@whiskeysockets/baileys";
import { IChannel, SendMessageOptions } from "./IChannel.js";
import Whatsapp from "../../models/Whatsapp.js";
import { logger } from "../../utils/logger.js";
import { getIO } from "../../libs/socket.js";
import { useRedisAuthState } from "./RedisAuthState.js";
import { createClient } from "redis";
import AppError from "../../errors/AppError.js";
import HandleMessageService from "../MessageServices/HandleMessageService.js";
import * as Sentry from "@sentry/node";

export class BaileysChannel implements IChannel {
  private socket: WASocket | null = null;
  private whatsapp: Whatsapp;
  private redisClient: any;
  private retryCount = 0;

  constructor(whatsapp: Whatsapp) {
    this.whatsapp = whatsapp;
    this.redisClient = createClient({ url: process.env.REDIS_URL || "redis://redis:6379" });
    this.redisClient.connect().catch((err: any) => logger.error({ err }, "Redis connection error in BaileysChannel"));
  }

  async start(): Promise<void> {
    logger.info(`Starting Baileys Session: ${this.whatsapp.name}`);
    try {
      const { state, saveCreds } = await useRedisAuthState(this.redisClient, `baileys-${this.whatsapp.id}-`);

      this.socket = makeWASocket({
        logger: logger as any,
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger as any),
        },
        browser: ["Whaticket", "Chrome", "10.0"],
      });

      this.socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            logger.info("QR Code received");
            await this.whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });
            const io = getIO();
            io.to(`company-${this.whatsapp.companyId}`).emit(`whatsappSession`, {
                action: "update",
                session: this.whatsapp
            });
        }

        if (connection === "close") {
            const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
            logger.warn(`Connection closed. Reconnecting: ${shouldReconnect}`);

            if (shouldReconnect) {
               if (this.retryCount < 5) {
                   this.retryCount++;
                   setTimeout(() => this.start(), 2000 * this.retryCount);
               } else {
                   await this.whatsapp.update({ status: "DISCONNECTED", qrcode: "" });
               }
            } else {
                await this.whatsapp.update({ status: "DISCONNECTED", qrcode: "" });
            }
        }

        if (connection === "open") {
            logger.info("Connection opened");
            await this.whatsapp.update({ status: "CONNECTED", qrcode: "", retries: 0 });
            const io = getIO();
            io.to(`company-${this.whatsapp.companyId}`).emit(`whatsappSession`, {
                action: "update",
                session: this.whatsapp
            });
            this.retryCount = 0;
        }
      });

      this.socket.ev.on("creds.update", saveCreds);

      this.socket.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        for (const msg of messages) {
           await HandleMessageService(msg, this.whatsapp);
        }
      });

    } catch (err) {
      logger.error({ err }, "Error starting Baileys session");
      throw new AppError("ERR_STARTING_BAILEYS_SESSION");
    }
  }

  async stop(): Promise<void> {
    logger.info(`Stopping Baileys Session: ${this.whatsapp.name}`);
    this.socket?.end(undefined);
    this.socket = null;
  }

  async sendMessage(contactId: number | string, content: string, options?: SendMessageOptions): Promise<any> {
    if (!this.socket) throw new Error("Socket not initialized");

    const jid = this.formatJid(contactId);

    if (options?.isRecorded && options.mediaUrl) {
         return this.socket.sendMessage(jid, {
             audio: { url: options.mediaUrl },
             ptt: true
         }, {
            quoted: options.quotedMsgId ? { key: { id: String(options.quotedMsgId) } } as any : undefined
         });
    }

    if (options?.mediaUrl) {
         const type = options.mediaType === "video" ? "video" : options.mediaType === "audio" ? "audio" : "image";
         if (options.mediaType === "document") {
             return this.socket.sendMessage(jid, {
                 document: { url: options.mediaUrl },
                 mimetype: "application/pdf",
                 fileName: options.fileName
             });
         }

         return this.socket.sendMessage(jid, {
            [type]: { url: options.mediaUrl },
            caption: options.caption
         } as any);
    }

    return this.socket.sendMessage(jid, { text: content });
  }

  async sendStatus(contactId: number | string, status: "composing" | "recording"): Promise<void> {
    if (!this.socket) return;
    const jid = this.formatJid(contactId);
    await this.socket.sendPresenceUpdate(status, jid);
  }

  async healthCheck(): Promise<boolean> {
     return this.socket?.user ? true : false;
  }

  private formatJid(contactId: number | string): string {
      if (String(contactId).includes("@")) return String(contactId);
      return `${contactId}@s.whatsapp.net`;
  }
}
