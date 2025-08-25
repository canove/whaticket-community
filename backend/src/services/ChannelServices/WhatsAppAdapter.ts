import { ChannelAdapter, SendMessageResult, SendMediaResult, ChannelStatus } from "./ChannelAdapter";
import { logger } from "../../utils/logger";
import { getWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";

export class WhatsAppAdapter extends ChannelAdapter {
  private whatsapp: Whatsapp | null = null;

  constructor(config: any) {
    super(config, "whatsapp");
  }

  async sendMessage(
    contactNumber: string,
    message: string,
    options?: Record<string, any>
  ): Promise<SendMessageResult> {
    try {
      const formattedNumber = this.formatPhoneNumber(contactNumber);
      
      if (!this.isValidPhoneNumber(formattedNumber)) {
        throw new Error(`Invalid phone number: ${contactNumber}`);
      }

      const whatsapp = await this.getWhatsAppInstance();
      const wbot = getWbot(whatsapp.id);

      if (!wbot) {
        throw new Error("WhatsApp instance not connected");
      }

      const chatId = `${formattedNumber}@c.us`;
      const sentMessage = await wbot.sendMessage(chatId, message);

      await this.rateLimitDelay(1); // WhatsApp rate limit: 1 message per second

      return {
        success: true,
        messageId: sentMessage.id.id,
        externalId: sentMessage.id._serialized,
        delivered: sentMessage.ack >= 2
      };

    } catch (error) {
      logger.error("WhatsApp send message error:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendMedia(
    contactNumber: string,
    mediaPath: string,
    caption?: string,
    options?: Record<string, any>
  ): Promise<SendMediaResult> {
    try {
      const formattedNumber = this.formatPhoneNumber(contactNumber);
      
      if (!this.isValidPhoneNumber(formattedNumber)) {
        throw new Error(`Invalid phone number: ${contactNumber}`);
      }

      const whatsapp = await this.getWhatsAppInstance();
      const wbot = getWbot(whatsapp.id);

      if (!wbot) {
        throw new Error("WhatsApp instance not connected");
      }

      const chatId = `${formattedNumber}@c.us`;
      
      // Create media from path
      const media = await import("whatsapp-web.js").then(module => 
        module.MessageMedia.fromFilePath(mediaPath)
      );

      const sentMessage = await wbot.sendMessage(chatId, media, {
        caption: caption || undefined
      });

      await this.rateLimitDelay(1); // WhatsApp rate limit

      return {
        success: true,
        messageId: sentMessage.id.id,
        externalId: sentMessage.id._serialized,
        mediaId: sentMessage.id.id,
        delivered: sentMessage.ack >= 2
      };

    } catch (error) {
      logger.error("WhatsApp send media error:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getStatus(): Promise<ChannelStatus> {
    try {
      const whatsapp = await this.getWhatsAppInstance();
      const wbot = getWbot(whatsapp.id);

      if (!wbot) {
        return {
          isConnected: false,
          connectionName: whatsapp.name,
          error: "WhatsApp bot not found"
        };
      }

      const state = await wbot.getState();
      
      return {
        isConnected: state === "CONNECTED",
        connectionName: whatsapp.name,
        lastActivity: new Date(),
        error: state !== "CONNECTED" ? `WhatsApp state: ${state}` : undefined
      };

    } catch (error) {
      logger.error("WhatsApp get status error:", error);
      return {
        isConnected: false,
        error: error.message
      };
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      return status.isConnected;
    } catch (error) {
      logger.error("WhatsApp validate connection error:", error);
      return false;
    }
  }

  private async getWhatsAppInstance(): Promise<Whatsapp> {
    if (this.whatsapp) {
      return this.whatsapp;
    }

    this.whatsapp = await Whatsapp.findOne({
      where: {
        id: this.config.channelId,
        tenantId: this.config.tenantId
      }
    });

    if (!this.whatsapp) {
      throw new Error("WhatsApp instance not found");
    }

    return this.whatsapp;
  }

  protected formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle Brazilian numbers
    if (cleaned.length === 11 || cleaned.length === 10) {
      cleaned = `55${cleaned}`;
    }
    
    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, '');
    
    return cleaned;
  }

  protected isValidPhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Brazilian numbers: 55 + area code (2 digits) + number (8-9 digits)
    return cleaned.length >= 12 && cleaned.length <= 15 && cleaned.startsWith('55');
  }
}

export default WhatsAppAdapter;