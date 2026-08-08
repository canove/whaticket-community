import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { whatsappProvider, ProviderMessage } from "../../providers/WhatsApp";

import formatBody from "../../helpers/Mustache";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;  
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,  
}: Request): Promise<ProviderMessage> => {    
  if (!ticket.whatsappId) {
    throw new AppError("ERR_TICKET_NO_WHATSAPP");
  }

  const chatId = `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`;  
  let sentMessage;
  try {        
    if(quotedMsg?.id) {
      sentMessage = await whatsappProvider.sendReply(
        ticket.whatsappId,
        quotedMsg.id,
        formatBody(body, ticket.contact),
        chatId,
        quotedMsg.fromMe
      )
    } else {      
      sentMessage = await whatsappProvider.sendMessage(
        ticket.whatsappId,
        chatId,
        formatBody(body, ticket.contact),
        {
          quotedMessageId: quotedMsg?.id,
          quotedMessageFromMe: quotedMsg?.fromMe,
          linkPreview: false
        }
      );
    }
    await ticket.update({ lastMessage: body });
    return sentMessage;
  } catch (err) {
    console.log(err)
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
