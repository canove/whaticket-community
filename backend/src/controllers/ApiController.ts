import { Request, Response } from "express";
import * as Yup from "yup";
import path from "path";
import AppError from "../errors/AppError";
import Message from "../database/models/Message";
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

const createContact = async (newContact: string, companyId: number) => {
  return null;
};
/* eslint-disable */
export const importDispatcherFileProcess = async (req: Request, res: Response) => {
  const io = getIO();

  const { reports: files } = await ListFileService({ status: FileStatus.WaitingImport, initialDate: null, limiting: 1, companyId: 0 });
  if (files) {
    files.forEach(async (file) => {
      await file.update({ status: FileStatus.Processing });

      io.emit(`file${file.companyId}`, {
        action: "update",
        file
      });

      await ImportFileService({ key: path.basename(file.url), createdAt: file.CreatedAt, file: file });

      io.emit(`file${file.companyId}`, {
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
  
  const { reports: files } = await ListFileService({ status: FileStatus.WaitingDispatcher, initialDate: null, limiting: 1, companyId: 0 });
  const { reports: sendingFiles } = await ListFileService({ status: FileStatus.Sending, initialDate: null, limiting: 1, companyId: 0 });

  if (sendingFiles?.length > 0) {
    sendingFiles.forEach(async (file) => {
      await DispatcherRegisterService({ file });
    });
  } else {
    if (files?.length > 0) {
      files.forEach(async (file) => {
        await file.update({ status: FileStatus.Sending });

        io.emit(`file${file.companyId}`, {
          action: "update",
          file
        });
  
        await DispatcherRegisterService({ file });

        io.emit(`file${file.companyId}`, {
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
  const companyId = req.user.companyId;

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

  const contactAndTicket = await createContact(newContact.number, companyId);

  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppMedia({ media, ticket: contactAndTicket, companyId, body });
      })
    );
  } else {
    await SendWhatsAppMessage({ body, ticket: contactAndTicket, companyId, fromMe: true, bot: false, whatsMsgId: null });
  }

  return res.send();
};