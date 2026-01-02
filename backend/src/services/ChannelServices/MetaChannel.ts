import axios from "axios";
import { IChannel, SendMessageOptions } from "./IChannel.js";
import Whatsapp from "../../models/Whatsapp.js";
import { logger } from "../../utils/logger.js";

export class MetaChannel implements IChannel {
  private whatsapp: Whatsapp;
  private apiVersion = "v18.0";
  private baseUrl = "https://graph.facebook.com";

  constructor(whatsapp: Whatsapp) {
    this.whatsapp = whatsapp;
  }

  async start(): Promise<void> {
    logger.info(`Starting Meta Channel for ${this.whatsapp.name}`);
    await this.healthCheck();
  }

  async stop(): Promise<void> {
    logger.info("Stopping Meta Channel");
  }

  async sendMessage(contactId: number | string, content: string, options?: SendMessageOptions): Promise<any> {
    const phoneNumberId = this.whatsapp.qrcode;
    const accessToken = this.whatsapp.session;

    const url = `${this.baseUrl}/${this.apiVersion}/${phoneNumberId}/messages`;

    const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };

    let body: any = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: contactId,
    };

    if (options?.isRecorded && options.mediaUrl) {
         body.type = "audio";
         body.audio = { link: options.mediaUrl };
    } else if (options?.mediaUrl) {
        if (options.mediaType === "image") {
            body.type = "image";
            body.image = { link: options.mediaUrl, caption: options.caption };
        } else if (options.mediaType === "video") {
            body.type = "video";
            body.video = { link: options.mediaUrl, caption: options.caption };
        } else if (options.mediaType === "document") {
             body.type = "document";
             body.document = { link: options.mediaUrl, caption: options.caption, filename: options.fileName };
        }
    } else {
        body.type = "text";
        body.text = { body: content };
    }

    try {
        const response = await axios.post(url, body, { headers });
        return response.data;
    } catch (error) {
        logger.error({ error }, "Error sending Meta message");
        throw error;
    }
  }

  async sendStatus(contactId: number | string, status: "composing" | "recording"): Promise<void> {
      // Meta API does not widely support presence updates via API in the same way
  }

  async healthCheck(): Promise<boolean> {
      try {
          const url = `${this.baseUrl}/debug_token?input_token=${this.whatsapp.session}&access_token=${this.whatsapp.session}`;
          const res = await axios.get(url);
          return res.data?.data?.is_valid;
      } catch (e) {
          return false;
      }
  }
}
