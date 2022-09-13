import axios from "axios";
import AppError from "../../errors/AppError";
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
  companyId: number;
}
/* eslint-disable */
const SendWhatsAppMessage = async ({
  body,
  ticket,
  companyId
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
    id: message[0].contactId
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
    } catch (e) {
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }
  } else {
    try {
      const apiUrl = `${process.env.WPPNOF_URL}/sendText`;
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
        "text": formatBody(body, ticket.contact)
      };

      var result = await axios.post(apiUrl, payload, {
        headers: {
          "api-key": `${process.env.WPPNOF_API_TOKEN}`,
          "sessionkey": `${process.env.WPPNOF_SESSION_KEY}`
        }
      });

      if(result.status == 200){
          const msgWhatsId = result.data.data.id;
          
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
    } catch (e) {
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }
  }
};

export default SendWhatsAppMessage;
