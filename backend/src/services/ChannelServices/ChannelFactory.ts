import Whatsapp from "../../models/Whatsapp.js";
import { IChannel } from "./IChannel.js";
import { BaileysChannel } from "./BaileysChannel.js";
import { MetaChannel } from "./MetaChannel.js";

export class ChannelFactory {
  private static channels: Map<number, IChannel> = new Map();

  public static getChannel(whatsapp: Whatsapp): IChannel {
    if (this.channels.has(whatsapp.id)) {
      return this.channels.get(whatsapp.id)!;
    }

    const isMeta = whatsapp.session && whatsapp.session.length > 300 && !whatsapp.session.includes("creds");

    let channel: IChannel;
    if (isMeta) {
        channel = new MetaChannel(whatsapp);
    } else {
        channel = new BaileysChannel(whatsapp);
    }

    this.channels.set(whatsapp.id, channel);
    return channel;
  }

  public static removeChannel(whatsappId: number) {
      this.channels.delete(whatsappId);
  }
}
