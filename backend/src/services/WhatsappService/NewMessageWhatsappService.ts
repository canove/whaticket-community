import * as Yup from "yup";
import * as Sentry from "@sentry/node";
import { promisify } from "util";
import { writeFile } from "fs";
import fs from "fs";
import AWS from "aws-sdk";
import AppError from "../../errors/AppError";
import Contact from "../../database/models/Contact";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import { logger } from "../../utils/logger";
import Ticket from "../../database/models/Ticket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import Whatsapp from "../../database/models/Whatsapp";
import FileRegister from "../../database/models/FileRegister";
import Company from "../../database/models/Company";
import axios from "axios";
import OfficialWhatsapp from "../../database/models/OfficialWhatsapp";
import { preparePhoneNumber9Digit, removePhoneNumber9Digit, removePhoneNumber9DigitCountry, removePhoneNumberCountry, removePhoneNumberWith9Country } from "../../utils/common";
import ShowCompanyService from "../CompanyService/ShowCompanyService";
import { Op } from "sequelize";
import SatisfactionSurveyResponses from "../../database/models/SatisfactionSurveyResponses";
import SatisfactionSurveys from "../../database/models/SatisfactionSurveys";
import ConnectionFiles from "../../database/models/ConnectionFile";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import ListCompanySettingsService from "../SettingServices/ListCompanySettingsService";

/*eslint-disable*/
interface Request {
  id: string;
  fromMe: boolean;
  isGroup: boolean;
  type: string;
  to: string;
  from: string;
  body: string;
  contactName: string;
  session: string;
  file: string;
  identification: number;
  bot?: boolean,
}

interface Response {
  success: boolean;
}

const GetWhatsappByIdentification = async (
  identification: number
): Promise<Whatsapp> => {
  const whatsapp = await Whatsapp.findOne({
    where: {
      whatsappAccountId: identification
    }
  });

  return whatsapp;
};

const GetWhatsappBySession = async (session: string): Promise<Whatsapp> => {
  const whatsapp = await Whatsapp.findOne({
    where: {
      name: session,
      deleted: false
    }
  });

  return whatsapp;
};

const NewMessageWhatsappService = async ({
  id,
  fromMe,
  isGroup,
  type,
  to,
  from,
  body,
  contactName,
  identification,
  file,
  session,
  bot
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    id: Yup.string().required(),
    fromMe: Yup.string().required(),
    body: Yup.string().required(),
    from: Yup.string().required(),
    to: Yup.string().required(),
    type: Yup.string().required(),
    isGroup: Yup.boolean().required()
  });

  try {
    await schema.validate({
      id,
      fromMe,
      body,
      from,
      to,
      type,
      isGroup
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }
  // eslint-disable-next-line no-use-before-define
  await handleMessage(
    id,
    fromMe,
    body,
    from,
    to,
    type,
    contactName,
    isGroup,
    identification,
    file,
    session,
    bot
  );
  return { success: true };
};

const verifyMessage = async (
  msg: {
    id: string;
    fromMe: boolean;
    body: string;
    from: string;
    to: string;
    type: string;
    isGroup: boolean;
    bot: boolean
  },
  ticket: Ticket,
  contact: Contact,
  contactName: string,
  isTicketCreated: boolean
) => {
  const messageData = {
    id: msg.id,
    ticketId: ticket.id,
    bot: (ticket.status == 'inbot' || msg.bot),
    // contactId: msg.fromMe ? undefined : contact.id,
    contactId: contact ? contact.id : undefined,
    body: msg.body,
    fromMe: msg.fromMe,
    mediaType: msg.type,
    read: msg.fromMe,
    companyId: ticket.companyId,
    author: contactName ? contactName : "DESCONHECIDO"
  };

  await ticket.update({ lastMessage: msg.body, lastMessageFromMe: msg.fromMe });

  await CreateMessageService({ messageData });

  if (isTicketCreated) {
    const connectionFile = await ConnectionFiles.findOne({
      where: { companyId: ticket.companyId },
      include: [
        {
          model: Whatsapp,
          as: "whatsapps",
          attributes: ["id"],
          where: { id: ticket.whatsappId },
          required: true,
        }
      ],
    });
  
    if (connectionFile && connectionFile.greetingMessage) {
      await SendWhatsAppMessage({
        body: connectionFile.greetingMessage,
        ticket: ticket,
        companyId: ticket.companyId,
        fromMe: true,
        bot: true,
        contactId: ticket.contactId,
        whatsMsgId: null,
        cation: null,
        type: "text",
        mediaUrl: null,
        templateButtons: null
      });
    }
  }

  const settings = await ListCompanySettingsService(ticket.companyId);

  if (settings && settings.useWorkTime && settings.message && settings.hours) {
    const isWorkTime = await verifyWorkTime(settings);

    if (!isWorkTime) {
      await SendWhatsAppMessage({
        body: settings.message,
        ticket: ticket,
        companyId: ticket.companyId,
        fromMe: true,
        bot: true,
        contactId: ticket.contactId,
        whatsMsgId: null,
        cation: null,
        type: "text",
        mediaUrl: null,
        templateButtons: null
      });
    }
  }
};

const verifyWorkTime = async (settings) => {
  let isWorkTime = false;

  const now = new Date();
  const day = now.getDay();

  const hours = now.getHours();
  const minutes = now.getMinutes();

  if (settings.days[day]) {
    const periods = settings.hours.trim().split(",");

    for (const period of periods) {
      const time = period.split("-");

      const hours1 = time[0].split(":");
      const hours2 = time[1].split(":");

      const hour1 = parseInt(hours1[0]);
      const hour2 = parseInt(hours2[0]);

      const minute1 = parseInt(hours1[1]);
      const minute2 = parseInt(hours2[1]);

      if ((hours > hour1) && (hours < hour2)) {
        isWorkTime = true;
        break;
      }

      if (hour1 === hour2) {
        if ((hours === hour1) && (minutes >= minute1) && (minutes < minute2)) {
          isWorkTime = true;
          break;
        }
      } else {
        if (((hours === hour1) && (minutes >= minute1)) || ((hours === hour2) && (minutes < minute2))) {
          isWorkTime = true;
          break;
        }
      }
    }
  } else {
    isWorkTime = false;
  }

  return isWorkTime;
} 

const verifyContact = async (
  contactName: string,
  contactNumber: string,
  companyId: number
): Promise<Contact> => {
  if (contactName == '') {
    const contact = await FileRegister.findAll({ where: { phoneNumber: contactNumber, companyId }, limit: 1 });
    if (contact.length > 0)
      contactName = contact[0].name;
  }

  const contactData = {
    name: contactName,
    number: contactNumber,
    isGroup: false,
    companyId
  };

  const contact = CreateOrUpdateContactService(contactData);

  return contact;
}

const handleMessage = async (
  id: string,
  fromMe: boolean,
  body: string,
  from: string,
  to: string,
  type: string,
  contactName: string,
  isGroup: boolean,
  identification: number,
  file: string = null,
  session: string,
  bot: boolean = false
): Promise<void> => {
  try {
    const unreadMessages = 1;
   
    let whatsapp: Whatsapp;
    if (identification) {
      whatsapp = await GetWhatsappByIdentification(identification);
    }
    if (session) {
      whatsapp = await GetWhatsappBySession(session);
    }

    //checar se é mesnagem de PING se for nao adicionar
    let receiverWhatsapp =  await GetWhatsappBySession(removePhoneNumber9Digit(to));
    let fromWhatsapp =  await GetWhatsappBySession(removePhoneNumber9Digit(from));
    if(!fromWhatsapp) {
      fromWhatsapp = await GetWhatsappBySession(from);
    }
    if(!receiverWhatsapp) {
      receiverWhatsapp = await GetWhatsappBySession(to);
    }

    if (receiverWhatsapp && fromWhatsapp) throw "number identification is a whatsapp dispatcher";
    //
    
    // eslint-disable-next-line no-throw-literal
    if (!whatsapp) throw "number identification not found";

    const contact = await verifyContact(contactName, from, whatsapp.companyId);

    const company = await ShowCompanyService(whatsapp.companyId);

    const reg = await FileRegister.findOne({
      where: { 
          companyId: whatsapp.companyId,
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
          whatsappId: whatsapp.id
      },
      order: [['createdAt', 'DESC']]
    });

    if (company.onlyOwnedMessages && !reg) {
      throw `company only owned messages: reg not found in this company.`;
    }

    if (reg && reg.interactionAt === null) {
      await reg.update({ interactionAt: new Date() });
      console.log("handleMessage reg interaction update: ", reg);
    }

    let ticket = null;

    const survey = await SatisfactionSurveyResponses.findOne({
      where: { 
        companyId: company.id, 
        contactId: contact.id,
        response: null,
        interactionAt: null
      },
      attributes: ["id", "ticketId"],
      include: [
        {
          model: SatisfactionSurveys,
          as: "satisfactionSurvey",
          attributes: ["id", "answers"],
          required: true
        }
      ],
      order: [["createdAt", "DESC"]]
    });
  
    if (survey) {
      console.log("handleMessage survey: ", survey);
      console.log("handleMessage survey: ", JSON.stringify(survey));

      const answers = JSON.parse(survey.satisfactionSurvey.answers);

      if (answers.includes(body)) {
        await survey.update({
          response: body,
          interactionAt: new Date()
        });

        ticket = await Ticket.findOne({
          where: { id: survey.ticketId }
        });

        console.log("handleMessage survey completed.");
      }
    }

    let isTicketCreated = false;

    if (!ticket) {
      const { ticket: tck, isCreated } = await FindOrCreateTicketService(
        contact,
        whatsapp.id,
        whatsapp.companyId,
        unreadMessages,
        null,
        false,
        bot
      );

      ticket = tck;
      isTicketCreated = isCreated;

      if (survey) {
        await survey.update({ interactionAt: new Date() });
      }
    }

    if (type !== "text") {
      await verifyMediaMessage(
        {
          id,
          fromMe,
          body,
          from,
          to,
          type,
          file,
          isGroup,
          bot
        }, 
        ticket, 
        contact,
        whatsapp,
        contactName,
        isTicketCreated,
      );
    } else {
      await verifyMessage(
        {
          id,
          fromMe,
          body,
          from,
          to,
          type,
          isGroup,
          bot
        },
        ticket,
        contact, 
        contactName,
        isTicketCreated,
      );
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling whatsapp message: Err: ${err}`);
  }
};

const writeFileAsync = promisify(writeFile);

interface MetaMedia {
  url: string;
  mime_type: string;
  sha256: string;
  file_size: number;
  id: string;
  messaging_product: string;
}

interface MediaData {
  data: MetaMedia;
}

const verifyMediaMessage = async (
  msg: {
    id: string;
    fromMe: boolean;
    body: string;
    from: string;
    to: string;
    type: string;
    file: string;
    isGroup: boolean;
    bot: boolean;
  },
  ticket: Ticket,
  contact: Contact,
  whatsapp: Whatsapp,
  contactName: string,
  isTicketCreated: boolean,
): Promise<void> => {  
  let type = msg.type;
  let mediaUrl = msg.body;

  if (whatsapp.official) {
    const path = require('path');
    const https = require('https');

    const officialWhatsapp = await OfficialWhatsapp.findOne({
      where: { id: whatsapp.officialWhatsappId }
    });

    const { data }: MediaData = await axios.get(`https://graph.facebook.com/v16.0/${msg.body}`, {
      headers: {
        "Authorization": `Bearer ${officialWhatsapp.facebookAccessToken}`,
      }
    });

    type = data.mime_type.split("/")[0];
    const fileType = data.mime_type.split("/")[1];

    const response = await axios({
      method: 'get',
      url: data.url,
      responseType: 'stream',
      headers: {
        "Authorization": `Bearer ${officialWhatsapp.facebookAccessToken}`,
      }
    });

    await response.data.pipe(fs.createWriteStream(`./src/downloads/${data.id}.${fileType}`));

    const blob = await fs.readFileSync(`./src/downloads/${data.id}.${fileType}`);
    const file = await path.basename(`./src/downloads/${data.id}.${fileType}`);

    mediaUrl = await uploadToS3(blob, file, type, ticket.companyId);

    // DELETE FILE
    fs.unlink(`./src/downloads/${data.id}.${fileType}`, (err: Error) => {
      if (err) {
        throw err;
      }
    });
  }

  const messageData = {
    id: msg.id,
    ticketId: ticket.id,
    bot: (ticket.status == 'inbot' || msg.bot),
    // contactId: msg.fromMe ? undefined : contact.id,
    contactId: contact ? contact.id : undefined,
    body: "",
    fromMe: msg.fromMe,
    read: msg.fromMe,
    mediaUrl: mediaUrl,
    mediaType: type,
    companyId: ticket.companyId,
    author: contactName ? contactName : "DESCONHECIDO"
  };

  await ticket.update({ lastMessage: msg.file, lastMessageFromMe: msg.fromMe });
  await CreateMessageService({ messageData });

  if (isTicketCreated) {
    const connectionFile = await ConnectionFiles.findOne({
      where: { companyId: ticket.companyId },
      include: [
        {
          model: Whatsapp,
          as: "whatsapps",
          attributes: ["id"],
          where: { id: ticket.whatsappId },
          required: true,
        }
      ],
    });
  
    if (connectionFile && connectionFile.greetingMessage) {
      await SendWhatsAppMessage({
        body: connectionFile.greetingMessage,
        ticket: ticket,
        companyId: ticket.companyId,
        fromMe: true,
        bot: true,
        contactId: ticket.contactId,
        whatsMsgId: null,
        cation: null,
        type: "text",
        mediaUrl: null,
        templateButtons: null
      });

      await ticket.update({ lastMessage: connectionFile.greetingMessage, lastMessageFromMe: true });
    }
  }
};

const uploadToS3 = async (blob, file, type, companyId): Promise<string> => {
  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })
    const dt = new Date();
    const fileName = `${dt.getTime()}_${file}`;
    let ext = file.split('.').pop();

    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `${companyId}/${dt.getFullYear()}/${(dt.getMonth()+1).toString().padStart(2,'0')}/${dt.getDate().toString().padStart(2,'0')}/${fileName}`,
        Body: blob,
        ContentEncoding: 'base64',
        ContentType: `${type}/${ext}`
    }

    var result = await new Promise<string>((resolve) => {
      s3.upload(params, (err, data) => {
        resolve(data.Location)
      })
    });

    return result;    
  }catch(err){
      console.log('ocorreu um erro ao tentar enviar o arquivo para o s3',err)
      console.log('ocorreu um erro ao tentar enviar o arquivo para o s3',JSON.stringify(err))
  }   
};

export default NewMessageWhatsappService;
