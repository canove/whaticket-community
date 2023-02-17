/*eslint-disable */
import { SQSClient } from "@aws-sdk/client-sqs";
import { QueryTypes } from "sequelize";
import { botMessage } from "../controllers/WhatsAppController";
import Message from "../database/models/Message";
import Ticket from "../database/models/Ticket";
import { getIO } from "../libs/socket";
import StartExposedImportService from "../services/ExposedImportService/StartExposedImportService";

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

        try {
          if (code === 200) {    
            const ack = 1;
            const msgWhatsId = (typeof response.data.id === "object") ? response.data.id._serialized : response.data.id;;

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
              await botMessage({
                "session": message.session ,
                "id": msgWhatsId,
                "fromMe": true,
                "bot":true,
                "isGroup":false,
                "type": message.type,
                "to": message.number,
                "from":message.session,
                "body": message.text
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
