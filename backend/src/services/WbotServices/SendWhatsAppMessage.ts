import { Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError.js";
import GetTicketWbot from "../../helpers/GetTicketWbot.js";
import GetWbotMessage from "../../helpers/GetWbotMessage.js";
import SerializeWbotMsgId from "../../helpers/SerializeWbotMsgId.js";
import Message from "../../models/Message.js";
import Ticket from "../../models/Ticket.js";

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
}: Request): Promise<WbotMessage> => {
  let quotedMsgSerializedId: string | undefined;
  if (quotedMsg) {
    await GetWbotMessage(ticket, quotedMsg.id);
    quotedMsgSerializedId = SerializeWbotMsgId(ticket, quotedMsg);
  }

  const wbot = await GetTicketWbot(ticket);

  try {
    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
      formatBody(body, ticket.contact),
      {
        quotedMessageId: quotedMsgSerializedId,
        linkPreview: false
      }
    );

    await ticket.update({ lastMessage: body });
    return sentMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
