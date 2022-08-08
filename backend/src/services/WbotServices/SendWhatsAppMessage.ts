import axios from "axios";
import { Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import SerializeWbotMsgId from "../../helpers/SerializeWbotMsgId";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";

import formatBody from "../../helpers/Mustache";
import Whatsapp from "../../database/models/Whatsapp";
import FileRegister from "../../database/models/FileRegister";
import CreateMessageService from "../MessageServices/CreateMessageService";

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

  const connnection = await Whatsapp.findOne({
    where: {
      id: ticket.whatsappId
  }});

  if (connnection?.official) {
    try {
      const message = await Message.findAll({
        where: {
          ticketId: ticket.id,
          fromMe: false
        },
        order: [
          ['createdAt', 'DESC'],
        ],
        limit: 1
      });
      const messageSended = await FileRegister.findOne({
        where: {
          msgWhatsId: message[0].id
        }
      });
      
      if(!messageSended)
        throw new AppError("ERR_SENDING_WAPP_MSG");

      const apiUrl = `https://graph.facebook.com/v13.0/${connnection.facebookPhoneNumberId}/messages`;
      const payload = {
        "messaging_product": "whatsapp",
        "preview_url": false,
        "recipient_type": "individual",
        "to": messageSended?.phoneNumber,
        "type": "text",
        "text": {
          "body": formatBody(body, ticket.contact)
        }
      };

      var result = await axios.post(apiUrl, payload, {
        headers: {
          "Authorization": `Bearer ${connnection.facebookToken}`
        }
      });
      if(result.status == 200){
          const msgWhatsId = result.data.messages[0].id;
          
          const messageData = {
            id: msgWhatsId,
            ticketId: ticket.id,
            contactId: undefined,
            body: body,
            fromMe: true,
            read: true,
            mediaUrl: null,
            mediaType: null,
            quotedMsgId: null
          };
        
          await ticket.update({ lastMessage: body });
          await CreateMessageService({ messageData });
      
      }else{
        throw new AppError("ERR_SENDING_WAPP_MSG");
      }
    } catch(e) {
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }
  } else {
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
  }
};

export default SendWhatsAppMessage;
