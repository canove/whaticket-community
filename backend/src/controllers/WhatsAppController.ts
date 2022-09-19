/*eslint-disable*/
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { removeWbot } from "../libs/wbot";
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
import axios from "axios";
import AppError from "../errors/AppError";

type ListQuery = {
  pageNumber: string | number;
  official: string | boolean;
}

interface WhatsappData {
  name: string;
  queueIds: number[];
  greetingMessage?: string;
  farewellMessage?: string;
  status?: string;
  isDefault?: boolean;
  official?: boolean;
  facebookToken?: string;
  facebookPhoneNumberId?: string;
  phoneNumber?: string;
  companyId?: string | number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const companyId = req.user.companyId;

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
    phoneNumber,
  }: WhatsappData = req.body;

  //FAZER VALIDAÇÃO PARA VER SE TEM SLOT DISPONIVEL PARA CRIAR O CHIP
  const companyId = req.user.companyId;

  const apiUrl = `${process.env.WPPNOF_URL}/checkAvailableCompany`;
   
  const payload = {
    "companyId": companyId
  };
  try {
    await axios.post(apiUrl, payload, {
      headers: {
        "api-key": `${process.env.WPPNOF_API_TOKEN}`,
        "sessionkey": `${process.env.WPPNOF_SESSION_KEY}`
      }
    });
  }catch(err) {
    throw new AppError(err['response'].data['message']);
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
    phoneNumber,
    companyId
  });

  StartWhatsAppSession(whatsapp);

  const io = getIO();
  io.emit("whatsapp", {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.emit("whatsapp", {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  const whatsapp = await ShowWhatsAppService(whatsappId);

  return res.status(200).json(whatsapp);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;

  const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId
  });

  const io = getIO();
  io.emit("whatsapp", {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.emit("whatsapp", {
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

  await DeleteWhatsAppService(whatsappId);

  const io = getIO();
  io.emit("whatsapp", {
    action: "delete",
    whatsappId: +whatsappId
  });

  return res.status(200).json({ message: "Whatsapp deleted." });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { official, pageNumber } = req.query as ListQuery;
  const companyId = req.user.companyId;

  const {
    whatsapps,
    count,
    hasMore
  } = await ListOfficialWhatsAppsService({ companyId, official, pageNumber });

  return res.status(200).json({
    whatsapps,
    count,
    hasMore
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
    session
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
    session
  });

  return res.status(200).json(message);
};

export const messageStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const { statusType, msgId, msgWhatsId, errorMessage } = req.body;

  const message = await StatusMessageWhatsappService({ statusType, msgId, msgWhatsId, errorMessage });

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