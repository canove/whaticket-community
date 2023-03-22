import { Op } from "sequelize";
import axios from "axios";
import AppError from "../../errors/AppError";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";

import formatBody from "../../helpers/Mustache";
import Whatsapp from "../../database/models/Whatsapp";
import FileRegister from "../../database/models/FileRegister";
import CreateMessageService from "../MessageServices/CreateMessageService";
import Contact from "../../database/models/Contact";
import {
  isValidHttpUrl,
  preparePhoneNumber9Digit,
  removePhoneNumber9Digit,
  removePhoneNumber9DigitCountry,
  removePhoneNumberCountry,
  removePhoneNumberWith9Country,
  sendMessageToSQS
} from "../../utils/common";
import OfficialWhatsapp from "../../database/models/OfficialWhatsapp";

import { v4 as uuidv4 } from "uuid";

interface Request {
  body: string;
  whatsMsgId: string;
  ticket: Ticket;
  quotedMsg?: Message;
  fromMe: boolean;
  companyId: number;
  bot: boolean;
  contactId?: number;
  cation?: string;
  type?: string;
  mediaUrl?: string;
  templateButtons?: any;
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
  cation,
  type,
  mediaUrl,
  templateButtons
}: Request): Promise<void> => {
  const connnection = await Whatsapp.findOne({
    where: {
      id: ticket.whatsappId
    }}
  );

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
    id: contactId > 0 ? contactId : message[0] ? message[0].contactId : ticket.contactId
  }});

  const messageSended = await FileRegister.findOne({
    where: {
      phoneNumber: contact.number,
      companyId: companyId
    }
  });
  
  if(!messageSended && !contact) {
    console.log()
    throw new AppError("ERR_CONTACT_NOT_FOUND");
  }

  const reg = await FileRegister.findOne({
    where: { 
        companyId: companyId,
        phoneNumber: 
          { 
            [Op.or]: [
              removePhoneNumberWith9Country(contact.number),
              preparePhoneNumber9Digit(contact.number),
              removePhoneNumber9Digit(contact.number),
              removePhoneNumberCountry(contact.number),
              removePhoneNumber9DigitCountry(contact.number)
            ],
          },
        whatsappId: connnection.id
    },
    order: [['createdAt', 'DESC']]
  });
   

  if (connnection?.official) {
    const lastMessage = await Message.findAll({
      where: {
        ticketId: ticket.id,
      },
      order: [
        ['createdAt', 'DESC'],
      ],
      limit: 1
    });
  
    if (lastMessage[0] && lastMessage[0].createdAt) {
      const today = new Date();
      const lastMessageDate = new Date(lastMessage[0].createdAt);
  
      const diff = lastMessageDate.getTime() - today.getTime();
  
      if (diff < -86400000) throw new AppError("ERR_SESSION_ENDED");
    }

    const offConnection = await OfficialWhatsapp.findOne({
      where: { id: connnection.officialWhatsappId }
    });

    try {
      const apiUrl = `https://graph.facebook.com/v13.0/${connnection.facebookPhoneNumberId}/messages`;

      const { url, fileName } = isValidHttpUrl(body);

      let typePayload = null;

      let defaultType = "text";

      if (cation || (type && type !== "text")) {
        defaultType = type ? type : "document";

        typePayload = {
          link: url,
          caption: cation ? formatBody(cation, reg) : ""
        }

        if (defaultType === "document" && fileName) typePayload = { ...typePayload, filename: fileName }
      } else {
        const newBody = formatBody(body, reg);
        typePayload = { body: newBody.replace(/&#x2F;/g, '/') };
      }

      const payload = {
        "messaging_product": "whatsapp",
        "preview_url": false,
        "recipient_type": "individual",
        "to": !messageSended?.phoneNumber ? contact.number : messageSended?.phoneNumber,
        "type": defaultType,
        [defaultType]: typePayload
      };

      var result = await axios.post(apiUrl, payload, {
        headers: {
          "Authorization": `Bearer ${offConnection.facebookAccessToken}`
        }
      });
      if(result.status == 200){
          const msgWhatsId = result.data.messages[0].id;
          
          const messageData = {
            id: msgWhatsId,
            ticketId: ticket.id,
            contactId: contact ? contact.id : undefined,
            body: body,
            fromMe: fromMe,
            read: true,
            mediaUrl: null,
            mediaType: null,
            quotedMsgId: null,
            companyId,
            userId: ticket.userId ? ticket.userId : null // UserID para salvar usuário que enviou mensagem
          };
        
          await ticket.update({ lastMessage: body, lastMessageFromMe: fromMe });
          await CreateMessageService({ messageData });
      
      }else{
        throw new AppError("ERR_SENDING_WAPP_MSG");
      }
    } catch (e) {
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }
  } else {
    try {
      const validUrl = isValidHttpUrl(body);

      let url = "";
      let bodyType = "";
      let fileName = "";

      if (validUrl) {
        url = validUrl.url
        bodyType = validUrl.type
        fileName = validUrl.fileName
      }
      
      let phoneNumber =  removePhoneNumber9Digit(!messageSended?.phoneNumber?contact.number: messageSended?.phoneNumber);
      
      if (phoneNumber.length > 12){
        let firstNumber = phoneNumber.substring(6,5);
        if(firstNumber == "9" || firstNumber == "8") {
          phoneNumber = `${phoneNumber.substring(4, 0)}${phoneNumber.substring(phoneNumber.length, 5)}`;
        }
      }

      let footer = null;

      if (type === "buttons") {
        bodyType = "buttons";

        if (templateButtons.image) url = templateButtons.image.url;

        footer = JSON.stringify({
          text: templateButtons.footer,
          buttons: templateButtons.templateButtons
        });
      }

      const messageData = {
        id: whatsMsgId ? whatsMsgId : uuidv4(),
        ack: 0,
        ticketId: ticket.id,
        contactId: contact ? contact.id : undefined,
        body: body ??  (type == 'buttons' ? templateButtons?.text :''),
        fromMe: fromMe,
        read: true,
        mediaUrl: url ? url : mediaUrl,
        mediaType: bodyType ? bodyType : type,
        quotedMsgId: null,
        bot: (ticket.status == 'inbot' || bot),
        companyId,
        footer,
        userId: ticket.userId ? ticket.userId : null // UserID para salvar usuário que enviou mensagem
      };

      await ticket.update({ 
        lastMessage: type == 'buttons' ? templateButtons?.text : body, 
        lastMessageFromMe: fromMe 
      });
      const createdMessage = await CreateMessageService({ messageData });

      if (whatsMsgId == '' || whatsMsgId == null) {
        const payload = {
          "messageId": createdMessage.id,
          "session": connnection.name,
          "number": phoneNumber,
          "path": url,
          "text": fileName != null && fileName != '' ? fileName : `${formatBody(body, reg)}`,
          "type": bodyType == '' ? type : bodyType
        };
  
        const headers = {
          "api-key": `${process.env.WPPNOF_API_TOKEN}`,
          "sessionkey": `${process.env.WPPNOF_SESSION_KEY}`
        };

        const params = {
          MessageBody: JSON.stringify({ message: payload, headers }),
          QueueUrl: process.env.SQS_ORQUESTRATOR_URL,
        }
        
        await sendMessageToSQS(params);
      }

      // let ack = 3;
      // let sendWhats;
      // if(whatsMsgId == '' || whatsMsgId == null) {
      //   sendWhats = await axios.post(apiUrl, payload, {
      //     headers: {
      //       "api-key": `${process.env.WPPNOF_API_TOKEN}`,
      //       "sessionkey": `${process.env.WPPNOF_SESSION_KEY}`
      //     }
      //   });
      //   if(sendWhats.status == 200) {
      //     ack = 0;
      //     whatsMsgId = (typeof sendWhats.data.data.id === "object") ? sendWhats.data.data.id._serialized : sendWhats.data.data.id;
      //   }
      // }

      // if(whatsMsgId != '' && whatsMsgId != null) {          
          // const messageData = {
          //   id: whatsMsgId,
          //   ack,
          //   ticketId: ticket.id,
          //   contactId: undefined,
          //   body: body,
          //   fromMe: fromMe,
          //   read: true,
          //   mediaUrl: url,
          //   mediaType: type,
          //   quotedMsgId: null,
          //   bot: (ticket.status == 'inbot' || bot),
          //   companyId
          // };
        
          // await ticket.update({ lastMessage: body });
          // await CreateMessageService({ messageData });
      
      // }else{
        // console.log('ERR_SENDING_WAPP_MSG_ERROR', payload);
        // console.log('ERR_SENDING_WAPP_MSG_ERROR', sendWhats);
        // throw new AppError("ERR_SENDING_WAPP_MSG");
      // }
    } catch (e: any) {
      if(e.message == 'Request failed with status code 504') {
        throw new AppError("ERR_SENDING_WAPP_MSG_RETRY");
      }
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }
  }
};

export default SendWhatsAppMessage;
