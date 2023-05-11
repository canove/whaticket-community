import { Consumer }from 'sqs-consumer';
import { genericCallbackStatus } from "./common";
import axios from "axios";
import { SQSClient } from "@aws-sdk/client-sqs";
import StatusMessageWhatsappService from '../services/WhatsappService/StatusMessageWhatsappService';
const CONSTANT = {
  region: process.env.ENV_AWS_REGION,
  key: process.env.ENV_AWS_ACCESS_KEY_ID,
  secret: process.env.ENV_AWS_SECRET_ACCESS_KEY
};


export const initMessageStatusConsumer = async (index) => {
  console.log(`CONSUMER ${index} INCIADO`)
  const app = Consumer.create({
    sqs: new SQSClient({
      region: CONSTANT.region,
      credentials: {
        accessKeyId: CONSTANT.key,
        secretAccessKey: CONSTANT.secret
      }
  }),
    batchSize: 10,
    queueUrl: process.env.SQS_MESSAGE_STATUS,
    handleMessage: async (record) => {
      let callbackFromWhatsApp = JSON.parse(record.Body);
      let webhook = callbackFromWhatsApp;
      const { session, status, id, type } = webhook;
    
      const callbackStatus = {
        "id": id,
        "status": status,
        "timestamp": callbackFromWhatsApp.timestamp,
        "recipient_id": callbackFromWhatsApp.phone,
      }

      await genericCallbackStatus({ session, status: callbackStatus, error: false });
    
      try{
        if(status == "RECEIVED" || status == "READ" || status == "delivered" || status == "sent" ) {
          let mapedStatus;
          switch(status){
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
          
          if(resultStatus.success){
            console.log('  -- NEW STATUS UPDATED OK --', id, statusType);
          }else{
            console.log('  -- NEW STATUS UPDATED ERROR --', id);
          }
        }
      }catch(e: any){
        if(e.message == 'Request failed with status code 502' || e.message == 'Request failed with status code 504') {
          console.log('Request failed with status code 502');
          return;
        }
        console.log(' -- ERROR OCCURRED FROM STATUS WEBHOOK -- ', id);
        console.log(e);
      }	
    }
  });
  
  app.on('error', (err) => {
    console.error(err.message);
  });
  
  app.on('processing_error', (err) => {
    console.error(err.message);
  });
  
  app.start();

};
