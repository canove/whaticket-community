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
import { preparePhoneNumber9Digit, removePhoneNumber9Digit, removePhoneNumber9DigitCountry, removePhoneNumberCountry, removePhoneNumberWith9Country } from "./common";

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
    handleMessageBatch: async records => {
      records.forEach(async record => {
        const { response, code, message } = JSON.parse(record.Body);

        /*TO DO SE VIER STATUS CODE 400 enviar para reprocessamento 
        {"session":"551151968683","number":"554195891447","text":"Olá, ADILSON DA SILVA ALVES, tudo bem? Aqui é da Pefisa/Pernambucanas! Temos uma informação IMPORTANTE para você! Caso possa conversa, digite SIM.","path":"Olá, ADILSON DA SILVA ALVES, tudo bem? Aqui é da Pefisa/Pernambucanas! Temos uma informação IMPORTANTE para você! Caso possa conversa, digite SIM.","type":"text","buttons":[]}
        */
        try {
          if (code === 200) {    
            const ack = 1;
            const msgWhatsId = response.messageId;

            if (message.messageId) {
              await Message.update({
                id: msgWhatsId,
                ack
              }, {
                where: {
                  id: message.messageId
                }
              });

              const msg = await Message.findOne({
                where: {
                  id: msgWhatsId
                }
              });
    
              const ticket = await Ticket.findOne({
                where: { id: msg.ticketId }
              });
  
              await ticket.update({ lastMessage: message.text });
  
              const io = getIO();
              io.emit(`appMessage${ticket.companyId}`, {
                action: "update",
                message: msg
              });

            } else {
              let mediaUrl = '';
              let body = message.text;

              if (message.mediaUrl) {
                if(!message.mediaUrl?.includes('http')) {
                  mediaUrl = '';
                }
              }

              if (message.path) {
                if(!message.path?.includes('http')) {
                  mediaUrl = '';
                } else {
                  mediaUrl = message.path;
                }
              }

              if (message.text === mediaUrl) {
                body = '';
              }

              await botMessage({
                "session": message.session,
                "id": msgWhatsId,
                "fromMe": true,
                "bot":true,
                "isGroup":false,
                "type": message.type == 'file'? 'document': message.type,
                "to": message.number,
                "from":message.session,
                "body": body,
                "mediaUrl": mediaUrl,
                "contactName": message.contactName
             });

             const whats = await Whatsapp.findOne({
              where: {
                name: message.session,
                deleted: false,
              }
             });

             const reg = await FileRegister.findOne({
              where: {
                phoneNumber: 
                { 
                  [Op.or]: [
                    removePhoneNumberWith9Country(message.number),
                    preparePhoneNumber9Digit(message.number),
                    removePhoneNumber9Digit(message.number),
                    removePhoneNumberCountry(message.number),
                    removePhoneNumber9DigitCountry(message.number)
                  ],
                },
                companyId: whats.companyId,
                processedAt: { [Op.ne]: null }
              },
              order: [["createdAt", "DESC"]]
            });

            await reg.update({
              sentAt: new Date(),
              msgWhatsId: msgWhatsId
            });
            }
          } else {
            const msg = await Message.findOne({
              where: { id: message.messageId }
            });
  
            const ticket = await Ticket.findOne({
              where: { id: msg.ticketId }
            });
  
            await msg.update({ ack: 5 });
            await ticket.update({ lastMessage: `(ERRO AO ENVIAR) ${message.text}` });

            await msg.reload();

            const io = getIO();
            io.emit(`appMessage${ticket.companyId}`, {
              action: "update",
              message: msg
            });
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
