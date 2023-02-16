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
          let msg = null;
          let ticket = null;

          if (code === 200) {    
            const ack = 1;
            const msgWhatsId = (typeof response.data.id === "object") ? response.data.id._serialized : response.data.id;;

            msg = await Message.findOne({
              where: { id: message.messageId }
            });
  
            ticket = await Ticket.findOne({
              where: { id: msg.ticketId }
            });

            // await msg.update({ 
            //   id: msgWhatsId,
            //   ack, 
            // });

            // await Message.findOne(message.messageId).then(function(mssg) {
            //   mssg.set('id', msgWhatsId, { raw: true });
            //   mssg.changed('id', true);
            //   mssg.save(); 
            // });

            // await msg.set({ id: msgWhatsId });
            // await msg.save();

            // await msg.changed('id');
            // await msg.update({ id: msgWhatsId });

            // await Message.sequelize?.query(
            //   `
            //     UPDATE Whaticket.Messages
            //     SET id = "${msgWhatsId}", akc = 1
            //     WHERE id = "${message.messageId}"
            //   `,
            //   { type: QueryTypes.UPDATE }
            // );

            await Message.update({
              id: msgWhatsId,
              ack
            }, {
              where: {
                id: message.messageId
              }
            });

            await ticket.update({ lastMessage: message.text });
          } else {
            msg = await Message.findOne({
              where: { id: message.messageId }
            });
  
            ticket = await Ticket.findOne({
              where: { id: msg.ticketId }
            });
  
            await msg.update({ ack: 5 });
            await ticket.update({ lastMessage: `(ERRO AO ENVIAR) ${message.text}` });
          }

          await msg.update();

          const io = getIO();
          io.emit(`appMessage${ticket.companyId}`, {
            action: "update",
            message: msg
          });
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
