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
import ExposedImport from "../../database/models/ExposedImport";
import  crypto  from "crypto";
import { createClient } from "redis";
import Whatsapp from "../../database/models/Whatsapp";
import ConnectionFiles from "../../database/models/ConnectionFile";
import OfficialTemplates from "../../database/models/OfficialTemplates";
import OfficialTemplatesStatus from "../../database/models/OfficialTemplatesStatus";
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
  } catch (err: any) {
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

  if (msgWhatsId) {
    const msgRegister = await Message.findOne({
      where: {
        id: msgWhatsId
      }
    });

   if(msgRegister) {
    console.log("update Message statusmessageservice 71");
    switch(statusType.toLowerCase()){
      case "sent":
        if (msgRegister?.ack === 2 || msgRegister?.ack === 3) break;

        await msgRegister?.update({ ack: 1 });
        break;
      case "delivered":
        if (msgRegister?.ack === 3) break;

        await msgRegister?.update({ ack: 2 });
        break;
      case "read":
        await msgRegister?.update({ ack: 3, read: 1 });
        break;
      case "error":
        await msgRegister?.update({ errorAt: new Date(), errorMessage: errorMessage });
        break;
    }

    const tck = await Ticket.findByPk(msgRegister.ticketId);
    const io = getIO();
    io.emit(`appMessage${tck.companyId}`, {
      action: "update",
      message: msgRegister
    });
   }
  }

  if (!register) {
    return { success: true };
  }

  console.log("update FileRegister statusmessageservice 103");
  switch(statusType.toLowerCase()){
    case "sent":
      await register?.update({ sentAt: new Date(), msgWhatsId: msgWhatsId });

      try {
        const client = createClient({
          url: process.env.REDIS_URL
        });

        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect();

        const whatsapp = await Whatsapp.findOne({
          where: { id: register.whatsappId },
          include: [{
            model: ConnectionFiles,
            as: "connectionFile",
            attributes: ["name"],
            required: true,
          }]
        });

        const info = {
          name: register.name,
          documentNumber: register.documentNumber,
          message: register.message,
          phoneNumber: register.phoneNumber,
          companyId: register.companyId,
          var1: register.var1,
          var2: register.var2,
          var3: register.var3,
          var4: register.var4,
          var5: register.var5,
          portfolio: (whatsapp && whatsapp.connectionFile) ? whatsapp.connectionFile.name : null
        }

        await client.set(`${msgWhatsId}`, JSON.stringify(info), {
          EX: parseInt(process.env.REDIS_SAVE_TIME)
        });

        await client.disconnect();
      } catch (err) {
        console.log("REDIS ERR - STATUS MESSAGE", err);
      }

      const message = await Message.findByPk(msgWhatsId);
        if (!message) {
          const file = await File.findByPk(register.fileId);
          const exposed = await ExposedImport.findByPk(register.exposedImportId);

          let template = null;
          let officialTemplate = null;

          if (file && file.templateId) {
            template = await Templates.findByPk(file.templateId);
          }
          if (exposed && exposed.templateId) {
            template = await Templates.findByPk(exposed.templateId);
          }

          if (register.template) {
            const templateStatus = await OfficialTemplatesStatus.findOne({
              where: {
                status: "APPROVED",
                whatsappId: register.whatsappId,
                companyId: (file ? file.companyId : exposed.companyId)
              },
              include: [
                {
                  model: OfficialTemplates,
                  as: "officialTemplate",
                  attributes: ["body", "footer", "mapping", "header"],
                  required: true,
                  where: {
                    name: register.template
                  }
                }
              ]
            });

            officialTemplate = templateStatus ? templateStatus.officialTemplate : null;
          }

          if (!template && !officialTemplate) {
            if (file && file.officialTemplatesId) {
              officialTemplate = await OfficialTemplates.findByPk(file.officialTemplatesId);
            }
            if (exposed && exposed.officialTemplatesId) {
              officialTemplate = await OfficialTemplates.findByPk(exposed.officialTemplatesId);
            }
          }

          let messageTxt = register.message;
          let mediaUrl = null;

          if (template) {
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
                if (messageType == 'ptt') {
                  messageType = 'audio';
                }
                let media = messagesTemplate.find((m) => m['type'] == messageType);
                messageTxt = media['value'];
                mediaUrl = messageTxt;
              break;
            }
          } 
          
          if (officialTemplate) {
            let body = officialTemplate.body;
            let header = JSON.parse(officialTemplate.header);

            const params = getTemplateParams(register.templateParams);
            const mapping = JSON.parse(officialTemplate.mapping);

            let paramIndex = 1;
            if (Array.isArray(params)) {
              params.forEach((param) => {
                if (!param) return;
                
                if (param.slice(0, 10) === "headerUrl:") {
                  const url = param.slice(10);
                  mediaUrl = url;
                } else {
                  body = body.replace(`{{${paramIndex}}}`, param);
                  paramIndex++;
                }
              });
            } else {
              Object.keys(mapping).forEach((key) => {
                const variable = mapping[key];

                const useReg = ["var1", "var2", "var3", "var4", "var5"].includes(variable);
                const text = useReg ? register[variable] : params[variable];
  
                body = body.replace(key, text);
              });

              if (header) {
                const variable = header.link;

                const useReg = ["var1", "var2", "var3", "var4", "var5"].includes(variable);
                const url = useReg ? register[variable] : params[variable];
  
                mediaUrl = url;
              }
            }

            messageTxt = body;
          }

          const contactData = {
            name: register.name ? `${register.name}` : "Nome: (não informado)",
            number: register.phoneNumber,
            companyId: (file ? file.companyId : exposed.companyId),
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

          /* CRIA A MENSAGEM NO CHAT */
          const messageData = {
            id: msgWhatsId ? msgWhatsId : crypto.randomBytes(16).toString('hex'),
            ticketId: createTicket.id,
            bot: createTicket.status == 'inbot',
            contactId: contact ? contact.id : undefined,
            body: (mediaUrl != null && !officialTemplate) ? '' : messageTxt == null ? '' : messageTxt,
            ack: 3,
            fromMe: true,
            read: true,
            mediaUrl: mediaUrl,
            mediaType: messageType,
            quotedMsgId: null,
            companyId: (file ? file.companyId : exposed.companyId)
          };
        
          await createTicket.update({ 
            lastMessage: messageTxt ? messageTxt : mediaUrl ? "mensagem de media" : "",
            lastMessageFromMe: true
          });
          await CreateMessageService({ messageData });
        }
        /*FIM*/
      break;
    case "unwhats":
        await register?.update({ haveWhatsapp: false });
        break;
    case "retry":
          await register?.update({ processedAt: null, whatsappId: null, sentAt: null });
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
      processedAt: null
    }
  });
  
  if (registersCount == 0 && register?.fileId) {
    const io = getIO();
    const file = await File.findOne({
        where: {
          id: register?.fileId
        }
    })
    await file.update({ status: FileStatus.Finished });
    io.emit(`file${file.companyId}`, {
      action: "update",
      file
    });
  }

  return { success: true };
};

const getTemplateParams = (templateParams: string) => {
  try {
    const params = JSON.parse(templateParams);
    return params;
  } catch {
    return templateParams.split(",");
  }
}

export default StatusMessageWhatsappService;
