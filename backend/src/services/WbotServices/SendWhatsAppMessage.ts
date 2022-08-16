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
import Contact from "../../database/models/Contact";

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

  const contact = await Contact.findOne({ where: {
    id: message[0].contactId
  }});

  const messageSended = await FileRegister.findOne({
    where: {
      phoneNumber: contact.number
    }
  });
  
  if(!messageSended && !contact)
    throw new AppError("ERR_SENDING_WAPP_MSG");

  if (connnection?.official) {
    try {
      const apiUrl = `https://graph.facebook.com/v13.0/${connnection.facebookPhoneNumberId}/messages`;
      const payload = {
        "messaging_product": "whatsapp",
        "preview_url": false,
        "recipient_type": "individual",
        "to": !messageSended?.phoneNumber?contact.number: messageSended?.phoneNumber,
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
    try {
      const apiUrl = `${process.env.WPPNOF_URL}/sendText`;
      const payload = {
        "session": connnection.name,
        "number": !messageSended?.phoneNumber?contact.number: messageSended?.phoneNumber,
        "text": formatBody(body, ticket.contact)
      };

      var result = await axios.post(apiUrl, payload, {
        headers: {
          "sessionkey": `${process.env.WPPNOF_API_TOKEN}`
        }
      });

      if(result.status == 200){
          const msgWhatsId = result.data.id;
          
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
  }
};

export default SendWhatsAppMessage;
