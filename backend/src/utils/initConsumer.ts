import { SQSClient } from "@aws-sdk/client-sqs";
import { getIO } from "../libs/socket";
import StartExposedImportService from "../services/ExposedImportService/StartExposedImportService";

const { Consumer } = require("sqs-consumer");
const AWS = require("aws-sdk");

const CONSTANT = {
  region: process.env.ENV_AWS_REGION,
  key: process.env.ENV_AWS_ACCESS_KEY_ID,
  secret: process.env.ENV_AWS_SECRET_ACCESS_KEY
};

export const initConsumer = () => {
  const app = Consumer.create({
    sqs: new SQSClient({
        region: CONSTANT.region,
        credentials: {
          accessKeyId: CONSTANT.key,
          secretAccessKey: CONSTANT.secret
        }
    }),
    batchSize: 1,
    queueUrl: process.env.SQS_DISPATCH_QUEUE,
    handleMessageBatch: async records => {
      records.forEach(async record => {
        try {
          const { payload, companyId, exposedImportId } = JSON.parse(record.Body);

          const exposedImport = await StartExposedImportService({
            exposedImportId,
            companyId,
            payload
          });

          const io = getIO();
          io.emit(`exposedImport${companyId}`, {
            action: "update",
            exposedImport
          });
        } catch (err) {
          console.log("Exposed Import Error", err);
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
