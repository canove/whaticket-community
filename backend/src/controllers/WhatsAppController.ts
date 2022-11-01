/*eslint-disable */
import { Request, Response } from "express";
import axios from "axios";
import { getIO } from "../libs/socket";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";

import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import NewMessageWhatsapp from "../services/WhatsappService/NewMessageWhatsappService";
import StatusMessageWhatsappService from "../services/WhatsappService/StatusMessageWhatsappService";
import ListOfficialWhatsAppsService from "../services/WhatsappService/ListOfficialWhatsAppsService";
import QualityNumberWhatsappService from "../services/WhatsappService/QualityNumberWhatsappService";
import NOFWhatsappQRCodeService from "../services/WhatsappService/NOFWhatsappQRCodeService";
import NOFWhatsappSessionStatusService from "../services/WhatsappService/NOFWhatsappSessionStatusService";
import AppError from "../errors/AppError";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import Whatsapp from "../database/models/Whatsapp";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import Contact from "../database/models/Contact";
import FileRegister from "../database/models/FileRegister";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";

type ListQuery = {
  pageNumber: string | number;
  official: string | boolean;
  connectionFileName?: string;
};

interface WhatsappData {
  name: string;
  queueIds: number[];
  greetingMessage?: string;
  farewellMessage?: string;
  status?: string;
  isDefault?: boolean;
  official?: boolean;
  facebookToken?: string;
  facebookBusinessId?: string;
  facebookPhoneNumberId?: string;
  phoneNumber?: string;
  companyId?: string | number;
  flowId?: string | number;
  connectionFileId?: string | number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const whatsapps = await ListWhatsAppsService(companyId);

  return res.status(200).json(whatsapps);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    status,
    isDefault,
    greetingMessage,
    farewellMessage,
    queueIds,
    official,
    facebookToken,
    facebookPhoneNumberId,
    facebookBusinessId,
    phoneNumber,
    flowId,
    connectionFileId
  }: WhatsappData = req.body;

  // FAZER VALIDAÇÃO PARA VER SE TEM SLOT DISPONIVEL PARA CRIAR O CHIP
  const { companyId } = req.user;

  const apiUrl = `${process.env.WPPNOF_URL}/checkAvailableCompany`;

  const payload = {
    companyId
  };
  
  if(!official) {
    try {
      await axios.post(apiUrl, payload, {
        headers: {
          "api-key": `${process.env.WPPNOF_API_TOKEN}`,
          sessionkey: `${process.env.WPPNOF_SESSION_KEY}`
        }
      });
    } catch (err: any) {
      throw new AppError(err.response.data.message);
    }
  }
 

  const { whatsapp, oldDefaultWhatsapp } = await CreateWhatsAppService({
    name,
    status,
    isDefault,
    greetingMessage,
    farewellMessage,
    queueIds,
    official,
    facebookToken,
    facebookPhoneNumberId,
    facebookBusinessId,
    phoneNumber,
    companyId,
    flowId,
    connectionFileId
  });

  StartWhatsAppSession(whatsapp);

  const io = getIO();
  io.emit(`whatsapp${companyId}`, {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.emit(`whatsapp${companyId}`, {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  return res.status(200).json(whatsapp);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { companyId } = req.user;

  const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId,
    companyId
  });

  const io = getIO();
  io.emit(`whatsapp${companyId}`, {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.emit(`whatsapp${companyId}`, {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  await DeleteWhatsAppService(whatsappId, companyId);

  const io = getIO();
  io.emit(`whatsapp${companyId}`, {
    action: "delete",
    whatsappId: +whatsappId
  });

  return res.status(200).json({ message: "Whatsapp deleted." });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { official, pageNumber, connectionFileName } = req.query as ListQuery;
  const { companyId } = req.user;

  const { whatsapps, count, hasMore, connectionFileId } = await ListOfficialWhatsAppsService({
    companyId,
    official,
    connectionFileName,
    pageNumber
  });

  return res.status(200).json({
    whatsapps,
    count,
    hasMore,
    connectionFileId
  });
};

export const newMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
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
  } = req.body;

  const message = await NewMessageWhatsapp({
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
  });

  return res.status(200).json(message);
};

export const messageStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { statusType, msgId, msgWhatsId, errorMessage, messageType } = req.body;

  const message = await StatusMessageWhatsappService({
    statusType,
    msgId,
    msgWhatsId,
    errorMessage,
    messageType
  });

  return res.status(200).json(message);
};

export const qualityNumber = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { displayPhoneNumber, event, currentLimit } = req.body;

  const message = await QualityNumberWhatsappService({
    displayPhoneNumber,
    event,
    currentLimit
  });

  return res.status(200).json(message);
};

export const health = async (
  req: Request,
  res: Response
): Promise<Response> => {
  return res.status(200).json("api is active and running");
};

const verifyContact = async (
  contactName: string,
  contactNumber: string,
  companyId: number
): Promise<Contact> => {
  if (contactName === "") {
    const contact = await FileRegister.findAll({
      where: { phoneNumber: contactNumber, companyId },
      limit: 1
    });
    if (contact.length > 0) contactName = contact[0].name;
  }

  const contactData = {
    name: contactName,
    number: contactNumber,
    isGroup: false,
    companyId
  };

  const contact = CreateOrUpdateContactService(contactData);

  return contact;
};

export const botMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { fromMe, to, body, contactName, session, bot } = req.body;

  if (!fromMe) {
    const message = await newMessage(req, res);
    return message;
  }

  const whatsapp = await Whatsapp.findOne({
    where: {
      name: session,
      deleted: false
    }
  });

  const contact = await verifyContact(contactName, to, whatsapp.companyId);

  const ticket = await FindOrCreateTicketService(
    contact,
    whatsapp.id,
    whatsapp.companyId,
    0,
    null,
    false,
    bot
  );

  await SendWhatsAppMessage({
    body,
    ticket,
    companyId: ticket.companyId,
    fromMe
  });

  return res.status(200).json("success");
};

export const nofSessionStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const { session, status } = req.body;
  const message = await NOFWhatsappSessionStatusService({
    session,
    status
  });

  return res.status(200).json(message);
};

export const nofSessionQRUpdate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { result, session, qrcode } = req.body;

  const message = await NOFWhatsappQRCodeService({
    result,
    session,
    qrcode
  });

  return res.status(200).json(message);
};
