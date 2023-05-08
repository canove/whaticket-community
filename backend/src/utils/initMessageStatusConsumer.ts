const { Consumer } = require("sqs-consumer");
import { SQSClient } from "@aws-sdk/client-sqs";
import StatusMessageWhatsappService from "../services/WhatsappService/StatusMessageWhatsappService";
import { genericCallbackStatus } from "./common";

const CONSTANT = {
  region: process.env.ENV_AWS_REGION,
  key: process.env.ENV_AWS_ACCESS_KEY_ID,
  secret: process.env.ENV_AWS_SECRET_ACCESS_KEY
};

const AWS = require('aws-sdk');
const sqs = new AWS.SQS({ region: CONSTANT.region }); // Defina a região do seu SQS

const QUEUE_URL = process.env.SQS_MESSAGE_STATUS; // Defina a URL da sua fila SQS
const MAX_MESSAGES = 10; // Defina o número máximo de mensagens a serem recebidas em cada iteração

const RECEIVE_PARAMS = {
  QueueUrl: QUEUE_URL,
  MaxNumberOfMessages: MAX_MESSAGES
};

export const initMessageStatusConsumer = async () => {
  console.log("START SQS Message Status Consumer");

  const { Messages } = await sqs.receiveMessage(RECEIVE_PARAMS).promise();

  if (Messages && Messages.length > 0) {
    for (const record of Messages) {
      let callbackFromWhatsApp = JSON.parse(record.Body);
      let webhook = callbackFromWhatsApp;
      const { session, status, id, type } = webhook;

      const callbackStatus = {
        id: id,
        status: status,
        timestamp: callbackFromWhatsApp.timestamp,
        recipient_id: callbackFromWhatsApp.phone
      };

      await genericCallbackStatus({
        session,
        status: callbackStatus,
        error: false
      });

      try {
        if (
          status == "RECEIVED" ||
          status == "READ" ||
          status == "delivered" ||
          status == "sent"
        ) {
          let mapedStatus;
          switch (status) {
            case "RECEIVED":
              mapedStatus = "delivered";
              break;
            case "READ":
              mapedStatus = "read";
              break;
          }

          let statusType = !mapedStatus ? status : mapedStatus;
          const resultStatus = await StatusMessageWhatsappService({
            msgWhatsId: id,
            statusType: statusType,
            messageType: type,
            errorMessage: ""
          });

          if (resultStatus.success) {
            removeFromQueue(record)
            console.log("  -- NEW STATUS UPDATED OK --", id, statusType);
          } else {
            console.log("  -- NEW STATUS UPDATED ERROR --", id);
          }
        }
      } catch (e: any) {
        if (
          e.message == "Request failed with status code 502" ||
          e.message == "Request failed with status code 504"
        ) {
          console.log("Request failed with status code 502");
          return;
        }
        console.log(" -- ERROR OCCURRED FROM STATUS WEBHOOK -- ", id);
        console.log(e);
      }
    }

    console.log("END SQS Message Status Consumer");
  }
};

const removeFromQueue = (message) => {
  sqs.deleteMessage({
      QueueUrl : QUEUE_URL,
      ReceiptHandle : message.ReceiptHandle
  }, function(err, data) {
      err && console.log(err);
  });
}
