/*eslint-disable */
import { SQSClient } from "@aws-sdk/client-sqs";
import { Op, QueryTypes } from "sequelize";
import { botMessage } from "../controllers/WhatsAppController";
import FileRegister from "../database/models/FileRegister";
import Message from "../database/models/Message";
import Ticket from "../database/models/Ticket";
import Whatsapp from "../database/models/Whatsapp";
import { getIO } from "../libs/socket";
import StartExposedImportService from "../services/ExposedImportService/StartExposedImportService";
import {
  genericCallbackStatus,
  preparePhoneNumber9Digit,
  removePhoneNumber9Digit,
  removePhoneNumber9DigitCountry,
  removePhoneNumberCountry,
  removePhoneNumberWith9Country,
  sendMessageToSQS
} from "./common";
import axios from "axios";
import { createClient } from "redis";
import GetCallbackService from "../services/WhatsappService/GetCallbackService";
import GetInfo from "../services/FileRegisterService/GetInfo";

const { Consumer } = require("sqs-consumer");
const AWS = require("aws-sdk");

const CONSTANT = {
  region: process.env.ENV_AWS_REGION,
  key: process.env.ENV_AWS_ACCESS_KEY_ID,
  secret: process.env.ENV_AWS_SECRET_ACCESS_KEY
};

export const initMessageResponseConsumer = () => {
  const app = Consumer.create({
    sqs: new SQSClient({
      region: CONSTANT.region,
      credentials: {
        accessKeyId: CONSTANT.key,
        secretAccessKey: CONSTANT.secret
      }
    }),
    queueUrl: process.env.SQS_ORQUESTRATOR_RESPONSE_URL,
    batchSize: 1,
    handleMessageBatch: async records => {
      records.forEach(async record => {
        const { response, code, message } = JSON.parse(record.Body);

        /*TO DO SE VIER STATUS CODE 400 enviar para reprocessamento 
        {"session":"551151968683","number":"554195891447","text":"Olá, ADILSON DA SILVA ALVES, tudo bem? Aqui é da Pefisa/Pernambucanas! Temos uma informação IMPORTANTE para você! Caso possa conversa, digite SIM.","path":"Olá, ADILSON DA SILVA ALVES, tudo bem? Aqui é da Pefisa/Pernambucanas! Temos uma informação IMPORTANTE para você! Caso possa conversa, digite SIM.","type":"text","buttons":[]}
        */
        try {
          if (
            code === 200 &&
            response &&
            response.message != "sessão inválida ou inexistente"
          ) {
            const msgWhatsId = response.messageId;

            if (message.messageId) {
              if (!msgWhatsId) {
                const headers = {
                  "api-key": `${process.env.WPPNOF_API_TOKEN}`,
                  sessionkey: `${process.env.WPPNOF_SESSION_KEY}`
                };

                const params = {
                  MessageBody: JSON.stringify({ message, headers }),
                  QueueUrl: process.env.SQS_ORQUESTRATOR_URL,
                  DelaySeconds: 60
                };

                await sendMessageToSQS(params);
              } else {
                await Message.update(
                  {
                    id: msgWhatsId
                  },
                  {
                    where: {
                      id: message.messageId
                    }
                  }
                );

                const msg = await Message.findOne({
                  where: {
                    id: msgWhatsId
                  }
                });

                if (msg.ack < 2) await msg.update({ ack: 1 });

                const ticket = await Ticket.findOne({
                  where: { id: msg.ticketId }
                });

                await ticket.update({ lastMessage: message.text });

                await msg.reload();

                const io = getIO();
                io.emit(`appMessage${ticket.companyId}`, {
                  action: "update",
                  message: msg,
                  oldId: message.messageId
                });
              }
            } else {
              let mediaUrl = "";
              let body = message.text;

              if (message.mediaUrl) {
                if (!message.mediaUrl?.includes("http")) {
                  mediaUrl = "";
                }
              }

              if (message.path) {
                if (
                  message.path?.includes("http") &&
                  !message.path?.trim().includes(" ")
                ) {
                  mediaUrl = message.path;
                } else {
                  mediaUrl = "";
                }
              }

              if (message.text === mediaUrl) {
                body = "";
              }

              await botMessage({
                session: message.session,
                id: msgWhatsId,
                fromMe: true,
                bot: true,
                isGroup: false,
                type: message.type == "file" ? "document" : message.type,
                to: message.number,
                from: message.session,
                body: body,
                mediaUrl: mediaUrl,
                contactName: message.contactName,
                templateButtons: message.templateButtons
                  ? message.templateButtons
                  : null
              });

              const reg = await getRegister(message);

              if (reg) {
                await reg.update({
                  sentAt: new Date(),
                  msgWhatsId: msgWhatsId
                });
              }
            }
          } else if(typeof message == 'object') {
            const whats = await Whatsapp.findOne({
              where: {
                name: message.session,
                status: "CONNECTED",
                deleted: false
              }
            });

            let retry = false;

            try {
              const CHECK_NUMBER_URL = `${process.env.WPPNOF_URL}/checkNumber`;

              const payload = {
                session: message.session,
                number: message.session
              };

              const { data } = await axios.post(CHECK_NUMBER_URL, payload, {
                headers: {
                  "api-key": process.env.WPPNOF_API_TOKEN,
                  sessionkey: process.env.WPPNOF_SESSION_KEY
                }
              });

              if (Array.isArray(data)) {
                for (const item of data) {
                  if (item.exists) {
                    retry = true;
                    break;
                  }
                }
              }
            } catch (err: any) {
              const response = err?.response?.data?.message || null;

              if (response === "time out de conexão") retry = true;
            }

            if (
              response.message ===
              "O telefone informado nao esta registrado no whatsapp."
            ) {
              const reg = await getRegister(message);

              if (reg) {
                await reg.update({
                  sentAt: new Date(),
                  haveWhatsapp: false
                });
              }
            } else {
              if (
                retry ||
                (whats &&
                  (response.message != "sessão inválida ou inexistente" ||
                    code == 500))
              ) {
                const headers = {
                  "api-key": `${process.env.WPPNOF_API_TOKEN}`,
                  sessionkey: `${process.env.WPPNOF_SESSION_KEY}`
                };

                const params = {
                  MessageBody: JSON.stringify({ message, headers }),
                  QueueUrl: process.env.SQS_ORQUESTRATOR_URL,
                  DelaySeconds: 60
                };

                await sendMessageToSQS(params);
              } else {
                if (message.messageId) {
                  const msg = await Message.findOne({
                    where: { id: message.messageId }
                  });

                  const ticket = await Ticket.findOne({
                    where: { id: msg.ticketId }
                  });

                  await msg.update({ ack: 5 });
                  await ticket.update({
                    lastMessage: `(ERRO AO ENVIAR) ${message.text}`
                  });

                  await msg.reload();

                  const io = getIO();
                  io.emit(`appMessage${ticket.companyId}`, {
                    action: "update",
                    message: msg
                  });

                  const callbackPayload = {
                    session: message.session,
                    status: {
                      phoneNumber: message.number,
                    },
                    error: true
                  };

                  await genericCallbackStatus(callbackPayload);
                } else {
                  let mediaUrl = "";
                  let body = message.text;

                  if (message.mediaUrl) {
                    if (!message.mediaUrl?.includes("http")) {
                      mediaUrl = "";
                    }
                  }

                  if (message.path) {
                    if (
                      message.path?.includes("http") &&
                      !message.path?.trim().includes(" ")
                    ) {
                      mediaUrl = message.path;
                    } else {
                      mediaUrl = "";
                    }
                  }

                  if (message.text === mediaUrl) {
                    body = "";
                  }

                  await botMessage({
                    session: message.session,
                    id: null,
                    fromMe: true,
                    bot: true,
                    isGroup: false,
                    type: message.type == "file" ? "document" : message.type,
                    to: message.number,
                    from: message.session,
                    body: body,
                    mediaUrl: mediaUrl,
                    contactName: message.contactName,
                    templateButtons: message.templateButtons
                      ? message.templateButtons
                      : null
                  });
                }
              }
            }
          }
        } catch (err) {
          console.log(err);
        }
      });
    }
  });

  app.on("error", err => {
    console.error(err.message);
  });

  app.on("processing_error", err => {
    console.error(err.message);
  });

  app.start();
};

const getRegister = async message => {
  const whats = await Whatsapp.findOne({
    where: { name: message.session },
    order: [["createdAt", "DESC"]]
  });

  const reg = await FileRegister.findOne({
    where: {
      phoneNumber: {
        [Op.or]: [
          removePhoneNumberWith9Country(message.number),
          preparePhoneNumber9Digit(message.number),
          removePhoneNumber9Digit(message.number),
          removePhoneNumberCountry(message.number),
          removePhoneNumber9DigitCountry(message.number)
        ]
      },
      companyId: whats.companyId,
      processedAt: { [Op.ne]: null }
    },
    order: [["createdAt", "DESC"]]
  });

  return reg;
};
