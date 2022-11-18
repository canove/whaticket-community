import axios from "axios";
import AppError from "../../errors/AppError";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";

import formatBody from "../../helpers/Mustache";
import Whatsapp from "../../database/models/Whatsapp";
import FileRegister from "../../database/models/FileRegister";
import CreateMessageService from "../MessageServices/CreateMessageService";
import Contact from "../../database/models/Contact";
import { isValidHttpUrl } from "../../utils/common";

interface Request {
  body: string;
  whatsMsgId: string;
  ticket: Ticket;
  quotedMsg?: Message;
  fromMe: boolean;
  companyId: number;
  bot: boolean;
  contactId?: number;
}
/* eslint-disable */
const SendWhatsAppMessage = async ({
  body,
  ticket,
  companyId,
  fromMe,
  bot,
  contactId,
  whatsMsgId,
}: Request): Promise<void> => {
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
    id: contactId > 0 ? contactId: message[0].contactId
  }});

  const messageSended = await FileRegister.findOne({
    where: {
      phoneNumber: contact.number,
      companyId: companyId
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
            fromMe: fromMe,
            read: true,
            mediaUrl: null,
            mediaType: null,
            quotedMsgId: null,
            companyId
          };
        
          await ticket.update({ lastMessage: body });
          await CreateMessageService({ messageData });
      
      }else{
        throw new AppError("ERR_SENDING_WAPP_MSG");
      }
    } catch (e) {
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }
  } else {
    try {
      const { url, type, fileName } = isValidHttpUrl(body);

      let apiUrl = `${process.env.WPPNOF_URL}/sendText`;
      switch(type) {
        case 'file':
          apiUrl = `${process.env.WPPNOF_URL}/sendFile`;
          break;
        case 'video':
          apiUrl = `${process.env.WPPNOF_URL}/sendVideo`;
          break;
        case 'image':
          apiUrl = `${process.env.WPPNOF_URL}/sendImage`;
          break;
      }

      let phoneNumber = !messageSended?.phoneNumber?contact.number: messageSended?.phoneNumber;
      
      if (phoneNumber.length > 12){
        let firstNumber = phoneNumber.substring(6,5);
        if(firstNumber == "9" || firstNumber == "8") {
          phoneNumber = `${phoneNumber.substring(4, 0)}${phoneNumber.substring(phoneNumber.length, 5)}`;
        }
      }

      const payload = {
        "session": connnection.name,
        "number": phoneNumber,
        "path": url,
        "text": fileName != null? fileName :`${formatBody(body, ticket.contact)}` 
      };

      let ack = 3;
      if(whatsMsgId == '' || whatsMsgId == null) {
        const sendWhats = await axios.post(apiUrl, payload, {
          headers: {
            "api-key": `${process.env.WPPNOF_API_TOKEN}`,
            "sessionkey": `${process.env.WPPNOF_SESSION_KEY}`
          }
        });
        if(sendWhats.status == 200) {
          ack = 0;
          whatsMsgId = sendWhats.data.data.id;
        }
      }

      if(whatsMsgId != '' && whatsMsgId != null) {          
          const messageData = {
            id: whatsMsgId,
            ack,
            ticketId: ticket.id,
            contactId: undefined,
            body: body,
            fromMe: fromMe,
            read: true,
            mediaUrl: url,
            mediaType: type,
            quotedMsgId: null,
            bot: (ticket.status == 'inbot' || bot),
            companyId
          };
        
          await ticket.update({ lastMessage: body });
          await CreateMessageService({ messageData });
      
      }else{
        throw new AppError("ERR_SENDING_WAPP_MSG");
      }
    } catch (e) {
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }
  }
};

export default SendWhatsAppMessage;
