import fs from "fs";
import { MessageMedia, Message as WbotMessage, MessageSendOptions } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";

import formatBody from "../../helpers/Mustache";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
}

const SendWhatsAppMedia = async ({
  media,
  ticket,
  body
}: Request): Promise<WbotMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket);
    const hasBody = body
      ? formatBody(body as string, ticket.contact)
      : undefined;

    const newMedia = MessageMedia.fromFilePath(media.path);
    
    let mediaOptions:MessageSendOptions = {
        caption: hasBody,
        sendAudioAsVoice: true
    };

    if (newMedia.mimetype.startsWith('image/') && ! /^.*\.(jpe?g|png|gif)?$/i.exec(media.filename)) {
       mediaOptions['sendMediaAsDocument'] = true;
    }
    
    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
      newMedia,
      mediaOptions
    );

    await ticket.update({ lastMessage: body || media.filename });

    fs.unlinkSync(media.path);

    return sentMessage;
  } catch (err) {
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;
