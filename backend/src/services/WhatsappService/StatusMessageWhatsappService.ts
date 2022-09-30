/*eslint-disable*/
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import FileRegister from "../../database/models/FileRegister";
import { FileStatus } from "../../enum/FileStatus";
import File from "../../database/models/File";
import Message from "../../database/models/Message";
import { getIO } from "../../libs/socket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import Templates from "../../database/models/TemplatesData";
import Ticket from "../../database/models/Ticket";
import { preparePhoneNumber } from "../../utils/common";

interface Request {
  msgId: number;
  statusType: string;
  messageType?: string;
  msgWhatsId?: string;
  errorMessage?: string;
}

interface Response {
  success: boolean;
}
const StatusMessageWhatsappService = async ({
  msgId,
  statusType,
  msgWhatsId,
  errorMessage,
  messageType
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    statusType: Yup.string().required()
  });

  try {
    await schema.validate({
      statusType,
      msgId
    });
  } catch (err) {
    throw new AppError(err.message);
  }
  let register;

  if (msgId) {
    register = await FileRegister.findOne({
      where: {
        id: msgId
      }
    });
  } 

  if ((msgId == null || msgId === undefined) && msgWhatsId) {
    register = await FileRegister.findOne({
      where: {
        msgWhatsId
      }
    });
  }

  if (!register && msgWhatsId) {
    const msgRegister = await Message.findOne({
      where: {
        id: msgWhatsId
      }
    });

   if(msgRegister) {
    switch(statusType){
      case "sent":
        await msgRegister?.update({ ack: 1 });
        break;
      case "delivered":
        await msgRegister?.update({ ack: 2 });
        break;
      case "read":
        await msgRegister?.update({ ack:3, read: 1 });
        break;
      case "error":
        await msgRegister?.update({ errorAt: new Date(), errorMessage: errorMessage });
        break;
    }

    const tck = await Ticket.findByPk(msgRegister.ticketId);
    const io = getIO();
    io.to(msgRegister.ticketId.toString()).emit(`whatsapp-message${tck.companyId}`, {
      action: "update",
      message: msgRegister
    });

    return { success: true }
   }
  }

  if (!register) {
    return { success: false };
  }

  switch(statusType){
    case "sent":
      await register?.update({ sentAt: new Date(), msgWhatsId: msgWhatsId });

      const message = await Message.findByPk(msgWhatsId);
        if(!message) {
          const file = await File.findByPk(register.fileId);
          let template = null;
          if(file.templateId) {
            template = await Templates.findByPk(file.templateId);
          }
          let messageTxt = register.message;
          let mediaUrl = null;

          if(template) {
            const messagesTemplate = JSON.parse(template.text);
           
            switch (messageType) {
              case 'text':
                let text = messagesTemplate.find((m) => m['type'] == messageType);
                messageTxt = text['value']
                .replace("{{name}}", register.name)
                .replace("{{documentNumber}}", register.documentNumber)
                .replace("{{phoneNumber}}", register.phoneNumber);
              break;
              case 'vcard':
              case 'contact':
                let contact = messagesTemplate.find((m) => m['type'] == 'contact');
                messageTxt = 'CONTATO: ' + preparePhoneNumber(contact['value']);
                break;
                case 'ptt':
                case 'image':
                case 'video':
                case 'audio':
                  if(messageType == 'ptt') {
                    messageType = 'audio';
                  }
                  let media = messagesTemplate.find((m) => m['type'] == messageType);
                  messageTxt = media['value'];
                  mediaUrl = messageTxt;
                  break;

            }
          }

          const contactData = {
            name: `${register.name}`,
            number: register.phoneNumber,
            companyId: file.companyId,
            profilePicUrl: null,
            isGroup: false
          };
        
          const contact = await CreateOrUpdateContactService(contactData);
          
          const createTicket = await FindOrCreateTicketService(
            contact,
            register.whatsappId,
            register.companyId,
            0,
            null,
            true
          );
          /*CRIA A MENSAGEM NO CHAT*/
          const messageData = {
            id: msgWhatsId,
            ticketId: createTicket.id,
            contactId: undefined,
            body: mediaUrl != null ? '' :messageTxt,
            ack: 3,
            fromMe: true,
            read: true,
            mediaUrl: mediaUrl,
            mediaType: messageType,
            quotedMsgId: null,
            companyId: file.companyId
          };
        
          await CreateMessageService({ messageData });
        }
        /*FIM*/
      break;
    case "delivered":
      await register?.update({ deliveredAt: new Date() });
      break;
    case "read":
      await register?.update({ readAt: new Date() });
      break;
    case "error":
      await register?.update({ sentAt: new Date(), errorAt: new Date(), errorMessage: errorMessage });
      break;
  }

  var registersCount = await FileRegister.count({
    where: {
      fileId: register?.fileId,
      sentAt: null
    }
  });
  
  if (registersCount == 0) {
    const io = getIO();
    const file = await File.findOne({
        where: {
          id: register?.fileId
        }
    })
    await file.update({ Status: FileStatus.Finished });
    io.emit(`file${file.companyId}`, {
      action: "update",
      file
    });
  }

  return { success: true };
};

export default StatusMessageWhatsappService;
