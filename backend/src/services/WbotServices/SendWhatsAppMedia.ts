import { promises as fsPromises } from "fs";
import AppError from "../../errors/AppError.js";
import Ticket from "../../models/Ticket.js";
import Whatsapp from "../../models/Whatsapp.js";
import { getProvider, ProviderMessage } from "../../providers/WhatsApp/index.js";
import { logger } from "../../utils/logger.js";
import { checkOutboundRateLimit } from "../../helpers/rateLimiter.js";
import { buildChatId } from "../../helpers/buildChatId.js";

import formatBody from "../../helpers/Mustache.js";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
}

const SendWhatsAppMedia = async ({
  media,
  ticket,
  body
}: Request): Promise<ProviderMessage> => {
  try {
    if (!ticket.whatsappId) {
      throw new AppError("ERR_TICKET_NO_WHATSAPP");
    }

    const whatsapp =
      ticket.whatsapp || (await Whatsapp.findByPk(ticket.whatsappId));
    const channel = whatsapp?.channel || "whatsapp";
    const chatId = buildChatId(channel, ticket.contact.number, ticket.isGroup);

    await checkOutboundRateLimit(ticket.whatsappId);

    const hasBody = body
      ? formatBody(body as string, ticket.contact)
      : undefined;

    const mediaInput = {
      filename: media.filename,
      mimetype: media.mimetype,
      path: media.path
    };

    const mediaOptions = {
      caption: hasBody,
      sendAudioAsVoice: true,
      sendMediaAsDocument:
        media.mimetype.startsWith("image/") &&
        !/^.*\.(jpe?g|png|gif)?$/i.exec(media.filename)
    };

    const sentMessage = await getProvider(channel).sendMedia(
      ticket.whatsappId,
      chatId,
      mediaInput,
      mediaOptions
    );

    await ticket.update({ lastMessage: body || media.filename });

    await fsPromises.unlink(media.path);

    return sentMessage;
  } catch (err) {
    logger.error({
      info: "Error sending WhatsApp media",
      err,
      chatId: ticket?.contact?.number
    });
    if (err instanceof AppError) throw err;
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;
