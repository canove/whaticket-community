/*eslint-disable */
import { Request, Response } from "express";
import axios from "axios";
import { getIO } from "../libs/socket";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import formidable from "formidable";
import fs from "fs";
import AWS from "aws-sdk";

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
import ListAllWhatsAppsService from "../services/WhatsappService/ListAllWhatsAppsService";
import TransferWhatsAppService from "../services/WhatsappService/TransferWhatsAppService";
import ListReportWhatsAppsService from "../services/WhatsappService/ListReportWhatsAppsService";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";

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
  business?: boolean;
  service?: string;
};

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
    connectionFileId,
    business,
    service
  }: WhatsappData = req.body;

  // FAZER VALIDAÇÃO PARA VER SE TEM SLOT DISPONIVEL PARA CRIAR O CHIP
  const { companyId } = req.user;

  const apiUrl = `${process.env.WPPNOF_URL}/checkAvailableCompany`;

  const payload = {
    companyId,
    service
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
        if(!err.response.data["message"]){
          throw new AppError("Ocorreu um erro ao tentar se comunicar com Firebase!");
        }
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
    connectionFileId,
    business,
  });

  StartWhatsAppSession(whatsapp, null);

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

export const transfer = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const transferData = req.body;
  const { companyId } = req.user;

  if (companyId !== 1) {
    throw new AppError("NO PERMISSION");
  }

  await TransferWhatsAppService({
    transferData,
  });

  return res.status(200).json("OK");
};

export const config = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const form = formidable({ multiples: false });

  const { companyId } = req.user;
  const { whatsappId } = req.params;

  const whatsapp = await Whatsapp.findOne({
    where: { id: whatsappId, companyId }
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WHATSAPP_FOUND");
  }

  const profileNameApiUrl = `${process.env.WPPNOF_URL}/setProfileName`;
  const profileImageApiUrl= `${process.env.WPPNOF_URL}/setProfilePicture`;

  const session = whatsapp.name;

  return form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json("occured an error");

    const { whatsName, whatsImage } = fields;

    if (files.file) {
      const filePath = files.file.filepath;
      const buffer = await fs.readFileSync(filePath);
      const fileName = files.file.originalFilename;

      const fileLink = await uploadToS3(fileName, companyId, buffer);

      if (whatsName !== whatsapp.whatsName) {
        const payload = {
          session,
          name: whatsName
        };

        try {
          await axios.post(profileNameApiUrl, payload, {
            headers: {
              "api-key": `${process.env.WPPNOF_API_TOKEN}`,
              sessionkey: `${process.env.WPPNOF_SESSION_KEY}`
            }
          });
        } catch (err: any) {
          if (!err.response.data["message"]) {
            throw new AppError("Ocorreu um erro ao tentar se comunicar com Firebase!");
          }
          throw new AppError(err.response.data.message);
        }

        await whatsapp.update({
          whatsName,
        });
      }

      if (fileLink !== whatsapp.whatsImage) {
        const payload = {
          session,
          path: fileLink
        };

        try {
          await axios.post(profileImageApiUrl, payload, {
            headers: {
              "api-key": `${process.env.WPPNOF_API_TOKEN}`,
              sessionkey: `${process.env.WPPNOF_SESSION_KEY}`
            }
          });
        } catch (err: any) {
          if (!err.response.data["message"]) {
            throw new AppError("Ocorreu um erro ao tentar se comunicar com Firebase!");
          }
          throw new AppError(err.response.data.message);
        }

        await whatsapp.update({
          whatsImage: fileLink,
        });
      }
    } else {
      if (whatsName !== whatsapp.whatsName) {
        const payload = {
          session,
          name: whatsName
        };

        try {
          await axios.post(profileNameApiUrl, payload, {
            headers: {
              "api-key": `${process.env.WPPNOF_API_TOKEN}`,
              sessionkey: `${process.env.WPPNOF_SESSION_KEY}`
            }
          });
        } catch (err: any) {
          if (!err.response.data["message"]) {
            throw new AppError("Ocorreu um erro ao tentar se comunicar com Firebase!");
          }
          throw new AppError(err.response.data.message);
        }

        await whatsapp.update({
          whatsName,
        });
      }
    }

    return res.status(200).json(whatsapp);
  });
};

export const multipleConfig = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const form = formidable({ multiples: false });

  const { companyId } = req.user;

  const profileNameApiUrl = `${process.env.WPPNOF_URL}/setProfileName`;
  const profileImageApiUrl= `${process.env.WPPNOF_URL}/setProfilePicture`;

  return form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json("occured an error");

    const { whatsName, whatsImage, whatsappIds } = fields;

    const whatsIds = whatsappIds.split(",");

    if (files.file) {
      const filePath = files.file.filepath;
      const buffer = await fs.readFileSync(filePath);
      const fileName = files.file.originalFilename;

      const fileLink = await uploadToS3(fileName, companyId, buffer);

      for (const whatsId of whatsIds) {
        const whatsapp = await Whatsapp.findOne({
          where: { id: whatsId, companyId }
        });
      
        if (!whatsapp) {
          console.log("ERR_NO_WHATSAPP_FOUND");
          continue;
        }

        const session = whatsapp.name;

        if (whatsName !== whatsapp.whatsName) {
          const payload = {
            session,
            name: whatsName
          };
  
          try {
            const result = await axios.post(profileNameApiUrl, payload, {
              headers: {
                "api-key": `${process.env.WPPNOF_API_TOKEN}`,
                sessionkey: `${process.env.WPPNOF_SESSION_KEY}`
              }
            });

            if (result.status == 200) {
              await whatsapp.update({
                whatsName,
              });
            } else {
              console.log(`${whatsapp.name} - Erro ao trocar nome`);
            }
          } catch (err: any) {
            if (!err.response.data["message"]) {
              console.log("Ocorreu um erro ao tentar se comunicar com Firebase!");
            }
            console.log(err.response.data.message);
          }
        }

        if (fileLink !== whatsapp.whatsImage) {
          const payload = {
            session,
            path: fileLink
          };
  
          try {
            const result = await axios.post(profileImageApiUrl, payload, {
              headers: {
                "api-key": `${process.env.WPPNOF_API_TOKEN}`,
                sessionkey: `${process.env.WPPNOF_SESSION_KEY}`
              }
            });

            if (result.status == 200) {
              await whatsapp.update({
                whatsImage: fileLink,
              });
            } else {
              console.log(`${whatsapp.name} - Erro ao trocar imagem`);
            }
          } catch (err: any) {
            if (!err.response.data["message"]) {
              console.log("Ocorreu um erro ao tentar se comunicar com Firebase!");
            }
            console.log(err.response.data.message);
          }
        }
      }
    } else {
      for (const whatsId of whatsIds) {
        const whatsapp = await Whatsapp.findOne({
          where: { id: whatsId, companyId }
        });
      
        if (!whatsapp) {
          console.log("ERR_NO_WHATSAPP_FOUND");
          continue;
        }

        const session = whatsapp.name;

        if (whatsName !== whatsapp.whatsName) {
          const payload = {
            session,
            name: whatsName
          };

          try {
            const result = await axios.post(profileNameApiUrl, payload, {
              headers: {
                "api-key": `${process.env.WPPNOF_API_TOKEN}`,
                sessionkey: `${process.env.WPPNOF_SESSION_KEY}`
              }
            });

            if (result.status == 200) {
              await whatsapp.update({
                whatsName,
              });
            } else {
              console.log(`${whatsapp.name} - Erro ao trocar nome`);
            }
          } catch (err: any) {
            if (!err.response.data["message"]) {
              console.log("Ocorreu um erro ao tentar se comunicar com Firebase!");
            }
            console.log(err.response.data.message);
          }
        }
      }
    }

    return res.status(200).json("OK");
  });
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

type ListQuery = {
  pageNumber: string | number;
  official: string | boolean;
  connectionFileName?: string;
  searchParam?: string;
  status?: string;
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { official, pageNumber, connectionFileName, searchParam, status } = req.query as ListQuery;
  const { companyId } = req.user;

  const { whatsapps, count, hasMore, connectionFileId } = await ListOfficialWhatsAppsService({
    companyId,
    official,
    connectionFileName,
    pageNumber,
    searchParam,
    status
  });

  return res.status(200).json({
    whatsapps,
    count,
    hasMore,
    connectionFileId
  });
};

type ListAllQuery = {
  searchParam: string;
  company: string;
  pageNumber: string;
  isBusiness: string;
  all: string;
}

export const listAll = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, company, pageNumber, isBusiness, all } = req.query as ListAllQuery;
  const { companyId } = req.user;

  if (companyId !== 1) {
    throw new AppError("NO PERMISSION!");
  }

  const { whatsapps, count, hasMore } = await ListAllWhatsAppsService({ searchParam, company, pageNumber, isBusiness, all });

  return res.status(200).json({
    whatsapps, 
    count, 
    hasMore
  });
};

type ListReportQuery = {
  searchParam: string;
  status: string;
  pageNumber: string;
}

export const listReport = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, status, pageNumber } = req.query as ListReportQuery;
  const { companyId } = req.user;

  const { reports, count, hasMore } = await ListReportWhatsAppsService({ searchParam, companyId, status, pageNumber });

  return res.status(200).json({
    reports, 
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
  const { fromMe, to, body, contactName, session, bot, id } = req.body;

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
    fromMe,
    bot,
    contactId: contact.id,
    whatsMsgId: id
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

const uploadToS3 = async (name, companyId, buffer) => {
  const companyData = await ShowCompanyService(companyId);
  const companyAlias = companyData.alias;

  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    const dt = new Date();
    const fileName = `${dt.getTime()}_${name}`;
    const ext = name.split(".").pop();

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${companyAlias}/${dt.getFullYear()}/${(dt.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${dt
        .getDate()
        .toString()
        .padStart(2, "0")}/${fileName}`,
      Body: buffer,
      ContentEncoding: "base64",
      ContentType: `image/${ext}`
    };

    const result = await new Promise<string>(resolve => {
      s3.upload(params, (err, data) => {
        resolve(data.Location);
      });
    });

    return result;
  } catch (err) {
    console.log("ocorreu um erro ao tentar enviar o arquivo para o s3", err);
    console.log(
      "ocorreu um erro ao tentar enviar o arquivo para o s3",
      JSON.stringify(err)
    );
  }
};
