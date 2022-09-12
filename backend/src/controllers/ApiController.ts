import { Request, Response } from "express";
import * as Yup from "yup";
import path from "path";
import AppError from "../errors/AppError";
import GetDefaultWhatsApp from "../helpers/GetDefaultWhatsApp";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import Message from "../database/models/Message";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import CheckContactNumber from "../services/WbotServices/CheckNumber";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import ListFileService from "../services/FileService/ListFileService";
import { FileStatus } from "../enum/FileStatus";
import ImportFileService from "../services/UploadFileService/ImportFileService";
import DispatcherRegisterService from "../services/UploadFileService/DispatcherRegisterService";
import { getIO } from "../libs/socket";
import DispatcherPingService from "../services/UploadFileService/DispatcherPingService";

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
};

interface ContactData {
  number: string;
}

const createContact = async (newContact: string) => {
  await CheckIsValidContact(newContact);

  const validNumber: any = await CheckContactNumber(newContact);

  const profilePicUrl = await GetProfilePicUrl(validNumber);

  const number = validNumber;

  const contactData = {
    name: `${number}`,
    number,
    profilePicUrl,
    isGroup: false
  };

  const contact = await CreateOrUpdateContactService(contactData);

  const defaultWhatsapp = await GetDefaultWhatsApp();

  const createTicket = await FindOrCreateTicketService(
    contact,
    defaultWhatsapp.id,
    1
  );

  const ticket = await ShowTicketService(createTicket.id);

  SetTicketMessagesAsRead(ticket);

  return ticket;
};
/* eslint-disable */
export const importDispatcherFileProcess = async (req: Request, res: Response) => {
  const io = getIO();
  const files = await ListFileService({ Status: FileStatus.WaitingImport,initialDate:null, limit: 1 });
  if (files) {
    files.forEach(async (file) => {
      await file.update({ Status: FileStatus.Processing });

      io.emit("file", {
        action: "update",
        file
      });

      await ImportFileService({ key: path.basename(file.url), createdAt: file.CreatedAt, file: file });

      io.emit("file", {
        action: "update",
        file
      });
    });
  }

  return res.status(200).json('request is processed');
};

/* eslint-disable */
export const dispatcherRegisterProcess = async (req: Request, res: Response) => {
  const io = getIO();
  const files = await ListFileService({ Status: FileStatus.WaitingDispatcher,initialDate:null, limit: 1 });
  const sendingFiles = await ListFileService({ Status: FileStatus.Sending,initialDate:null, limit: 1 });

  if (sendingFiles?.length > 0) {
    sendingFiles.forEach(async (file) => {
      await DispatcherRegisterService({ file: file });
    });
  } else {
    if (files?.length > 0) {
      files.forEach(async (file) => {
        await file.update({ Status: FileStatus.Sending });

        io.emit("file", {
          action: "update",
          file
        });
  
        await DispatcherRegisterService({ file: file });

        io.emit("file", {
        action: "update",
        file
      });

      });
    }
  }

  return res.status(200).json('request is processed');
};

/* eslint-disable */
export const pingConnections = async (req: Request, res: Response) => {
  await DispatcherPingService();
  return res.status(200).json('request is processed');
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const newContact: ContactData = req.body;
  const { body }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  newContact.number = newContact.number.replace("-", "").replace(" ", "");

  const schema = Yup.object().shape({
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  try {
    await schema.validate(newContact);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const contactAndTicket = await createContact(newContact.number);

  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppMedia({ body, media, ticket: contactAndTicket });
      })
    );
  } else {
    await SendWhatsAppMessage({ body, ticket: contactAndTicket });
  }

  return res.send();
};