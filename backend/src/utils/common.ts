import { createClient } from "redis";
import GetInfo from "../services/FileRegisterService/GetInfo";
import axios from "axios";
import GetCallbackService from "../services/WhatsappService/GetCallbackService";
import domain from "domain";

/*eslint-disable */
const AWS = require("aws-sdk");

const getRedisClient = async (): Promise<any> => {
  const d = domain.create();

  d.on('error', (err) => {
    console.error('Erro na conexão com o Redis:', err.message);
  });

  return await new Promise(async (resolve, reject) => {
    try {
      const client = createClient({
          url: process.env.REDIS_URL
      });
      await client.connect();
      resolve(client);
    }catch (err){ 
      reject(null);
    }
  });  
};

const preparePhoneNumber = (phone: string): string => {
  let phoneNumber = phone.replace("+", "");
  let country = phoneNumber.substring(0, 2);
  if (country != "55" && phoneNumber.length < 12) {
    phoneNumber = "55" + phoneNumber;
  }

  if (phoneNumber.length > 12) {
    if (phoneNumber.length > 12) {
      let firstNumber = phoneNumber.substring(6, 5);
      if (firstNumber == "9" || firstNumber == "8") {
        phoneNumber = `${phoneNumber.substring(4, 0)}${phoneNumber.substring(
          phoneNumber.length,
          5
        )}`;
      }
    }
  }
  return phoneNumber;
};

const preparePhoneNumber9Digit = (phone: string): string => {
  let phoneNumber = phone.replace("+", "");
  let country = phoneNumber.substring(0, 2);
  if (country != "55" && phoneNumber.length < 12) {
    phoneNumber = "55" + phoneNumber;
  }

  if (phoneNumber.length < 13) {
    phoneNumber = `${phoneNumber.substring(4, 0)}9${phoneNumber.substring(
      phoneNumber.length,
      4
    )}`;
  }
  return phoneNumber;
};

const removePhoneNumber9Digit = (phone: string): string => {
  let phoneNumber = phone.replace("+", "");
  let country = phoneNumber.substring(0, 2);
  if (country != "55" && phoneNumber.length < 12) {
    phoneNumber = "55" + phoneNumber;
  }

  if (phoneNumber.length == 13) {
    switch (phoneNumber.substring(5, 6)) {
      case "9":
      case "8":
      case "7":
        phoneNumber = `${phoneNumber.substring(0, 4)}${phoneNumber.substring(
          5,
          phoneNumber.length
        )}`;
    }
  }
  return phoneNumber;
};

const removePhoneNumberCountry = (phone: string): string => {
  let phoneNumber = phone.replace("+", "");
  let country = phoneNumber.substring(0, 2);
  if (country == "55") {
    phoneNumber = phoneNumber.substring(2, phoneNumber.length);
  }
  return phoneNumber;
};

const removePhoneNumberWith9Country = (phone: string): string => {
  let phoneNumber = phone.replace("+", "");
  let country = phoneNumber.substring(0, 2);
  if (country == "55") {
    phoneNumber = phoneNumber.substring(2, phoneNumber.length);
  }

  if (phoneNumber.length < 11) {
    phoneNumber = `${phoneNumber.substring(2, 0)}9${phoneNumber.substring(
      phoneNumber.length,
      2
    )}`;
  }
  return phoneNumber;
};

const removePhoneNumber9DigitCountry = (phone: string): string => {
  let phoneNumber = phone.replace("+", "");
  let country = phoneNumber.substring(0, 2);
  if (country == "55") {
    phoneNumber = phoneNumber.substring(2, phoneNumber.length);
  }

  phoneNumber = `${phoneNumber.substring(0, 2)}${phoneNumber.substring(
    3,
    phoneNumber.length
  )}`;
  return phoneNumber;
};

const isValidHttpUrl = (text: string): any => {
  let url;

  try {
    url = new URL(text);
  } catch (_) {
    return false;
  }

  let isValidUrl = url.protocol === "http:" || url.protocol === "https:";
  if (isValidUrl) {
    let urlSplit = url.toString().split("|");
    if (urlSplit.length > 1) {
      return {
        url: urlSplit[0],
        type: urlSplit[1],
        fileName: urlSplit[2]
      };
    }
    return null;
  }
  return null;
};

const CONSTANT = {
  region: process.env.ENV_AWS_REGION,
  key: process.env.ENV_AWS_ACCESS_KEY_ID,
  secret: process.env.ENV_AWS_SECRET_ACCESS_KEY
};

const SQS = new AWS.SQS({
  region: CONSTANT.region,
  secretAccessKey: CONSTANT.secret,
  accessKeyId: CONSTANT.key
});

const sendMessageToSQS = async (params): Promise<void> => {
  return new Promise((resolve, reject) => {
    SQS.sendMessage(params, function (err, data) {
      if (err)
        console.error("SendWhatsAppMessage - Message could not be sent to SQS");

      console.log(
        " -- SendWhatsAppMessage - Message sent to SQS -- ",
        params.QueueUrl
      );
      try {
        setTimeout(function () {
          resolve();
        }, 1000);
      } catch (e) {
        console.log("SendWhatsAppMessage - Message Error", e);
        resolve();
      }
    });
  });
};

const genericCallbackStatus = async request => {
  const { session, status, error } = request;

  const callback = await GetCallbackService(session);

  if (callback && callback.statusCallbackUrl) {
    let header = null;

    if (callback.callbackAuthorization) {
      header = {
        headers: {
          Authorization: callback.callbackAuthorization
        }
      };
    }

    let infoPayload = null;

    if (error) {
      infoPayload = {
        companyId: callback.companyId,
        registerId: status.registerId,
        phoneNumber: status.phoneNumber
      };
    } else {
      infoPayload = {
        companyId: callback.companyId,
        msgWhatsId: status.id,
        phoneNumber: status.recipient_id
      };
    }

    const info = await getInfo(infoPayload);

    let payload = null;

    if (error) {
      payload = {
        timestamp: new Date().getTime(),
        status: "error",
        recipient_id: status.phoneNumber,
        info: info ? info : null
      };
    } else {
      payload = {
        ...status,
        info: info ? info : null
      };
    }

    try {
      const response = await axios.post(
        callback.statusCallbackUrl,
        payload,
        header
      );
      console.log(" -- SEND STATUS GENERIC CALLBACK -- ", response);
    } catch (e) {
      console.log(" -- ERROR GENERIC CALLBACK STATUS -- ", JSON.stringify(e));
    }
  }
};

const getInfo = async ({ msgWhatsId, registerId, companyId, phoneNumber }) => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL
    });

    client.on("error", err => console.log("Redis Client Error", err));
    await client.connect();

    const value = await getRedisValue(phoneNumber, companyId, client);

    if (value) {
      return value;
    } else {
      const response = await GetInfo({
        msgWhatsId,
        registerId,
        phone: phoneNumber,
        companyId
      });

      return response;
    }
  } catch (e) {
    console.log(
      " -- ERROR GENERIC CALLBACK - getInfo -- ",
      phoneNumber,
      JSON.stringify(e)
    );
  }
};

const getRedisValue = async (
  phoneNumber: string,
  companyId: string,
  client: any
) => {
  let valueRedis = await client.get(`${phoneNumber}-${companyId}`);

  if (!valueRedis) {
    valueRedis = await client.get(
      `${removePhoneNumberWith9Country(phoneNumber)}-${companyId}`
    );
  }

  if (!valueRedis) {
    valueRedis = await client.get(
      `${preparePhoneNumber9Digit(phoneNumber)}-${companyId}`
    );
  }

  if (!valueRedis) {
    valueRedis = await client.get(
      `${removePhoneNumber9Digit(phoneNumber)}-${companyId}`
    );
  }

  if (!valueRedis) {
    valueRedis = await client.get(
      `${removePhoneNumberCountry(phoneNumber)}-${companyId}`
    );
  }

  if (!valueRedis) {
    valueRedis = await client.get(
      `${removePhoneNumber9DigitCountry(phoneNumber)}-${companyId}`
    );
  }

  if (valueRedis) {
    console.log("GENERIC CALLBACK - getInfo - REDIS VALUE: ", valueRedis);
    return JSON.parse(valueRedis);
  }

  console.log(
    "GENERIC CALLBACK - getInfo - REDIS - No Info Found",
    phoneNumber
  );
  return null;
};

export {
  getRedisClient,
  preparePhoneNumber,
  preparePhoneNumber9Digit,
  isValidHttpUrl,
  removePhoneNumber9Digit,
  removePhoneNumberCountry,
  removePhoneNumber9DigitCountry,
  removePhoneNumberWith9Country,
  sendMessageToSQS,
  genericCallbackStatus
};
