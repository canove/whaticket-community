import Whatsapp from "../../models/Whatsapp.js";
import {
  ProviderMessage,
  ProviderMediaInput,
  ProviderContact,
  SendMessageOptions,
  SendMediaOptions
} from "./types/index.js";
import { BaileysProvider } from "./Implementations/baileys.js";
import { InstagramProvider } from "./Implementations/instagram.js";
import { WhatsAppCloudProvider } from "./Implementations/whatsappCloud.js";

export interface WhatsappProvider {
  init(whatsapp: Whatsapp): Promise<void>;
  removeSession(whatsappId: number): void;
  logout(sessionId: number): Promise<void>;
  sendMessage(
    sessionId: number,
    to: string,
    body: string,
    options?: SendMessageOptions
  ): Promise<ProviderMessage>;
  sendMedia(
    sessionId: number,
    to: string,
    media: ProviderMediaInput,
    options?: SendMediaOptions
  ): Promise<ProviderMessage>;
  deleteMessage(
    sessionId: number,
    chatId: string,
    messageId: string,
    fromMe: boolean
  ): Promise<void>;
  checkNumber(sessionId: number, number: string): Promise<string>;
  getProfilePicUrl(sessionId: number, number: string): Promise<string>;
  getContacts(sessionId: number): Promise<ProviderContact[]>;
  sendSeen(sessionId: number, chatId: string): Promise<void>;
  fetchChatMessages(
    sessionId: number,
    chatId: string,
    limit: number
  ): Promise<ProviderMessage[]>;
}

export function getProvider(channel: string): WhatsappProvider {
  if (channel === "instagram") return InstagramProvider;
  if (channel === "whatsapp_cloud") return WhatsAppCloudProvider;
  return BaileysProvider;
}

// Kept for backwards compatibility — always refers to the WhatsApp (Baileys) provider
const whatsappProvider: WhatsappProvider = BaileysProvider;

export { whatsappProvider };
