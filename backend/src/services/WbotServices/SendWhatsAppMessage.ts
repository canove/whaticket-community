import AppError from "../../errors/AppError.js";
import Message from "../../models/Message.js";
import Ticket from "../../models/Ticket.js";
import Whatsapp from "../../models/Whatsapp.js";
import { getProvider, ProviderMessage } from "../../providers/WhatsApp/index.js";
import { logger } from "../../utils/logger.js";
import { checkOutboundRateLimit } from "../../helpers/rateLimiter.js";
import { buildChatId } from "../../helpers/buildChatId.js";

import formatBody from "../../helpers/Mustache.js";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg
}: Request): Promise<ProviderMessage> => {
  if (!ticket.whatsappId) {
    throw new AppError("ERR_TICKET_NO_WHATSAPP");
  }

  const whatsapp =
    ticket.whatsapp || (await Whatsapp.findByPk(ticket.whatsappId));
  const channel = whatsapp?.channel || "whatsapp";
  const chatId = buildChatId(channel, ticket.contact.number, ticket.isGroup);

  await checkOutboundRateLimit(ticket.whatsappId);

  try {
    const sentMessage = await getProvider(channel).sendMessage(
      ticket.whatsappId,
      chatId,
      formatBody(body, ticket.contact),
      {
        quotedMessageId: quotedMsg?.id,
        quotedMessageFromMe: quotedMsg?.fromMe,
        linkPreview: false
      }
    );

    await ticket.update({ lastMessage: body });
    return sentMessage;
  } catch (err) {
    logger.error({ info: "Error sending WhatsApp message", err, chatId });
    if (err instanceof AppError) throw err;
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
