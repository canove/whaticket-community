/*eslint-disable */
const AWS = require('aws-sdk');

const preparePhoneNumber = (phone:string): string => {
  let phoneNumber = phone.replace('+','');
  let country = phoneNumber.substring(0,2);
  if(country != '55' && phoneNumber.length < 12) {
    phoneNumber = '55' + phoneNumber;
  }

  if (phoneNumber.length > 12) {
    if (phoneNumber.length > 12){
      let firstNumber = phoneNumber.substring(6,5);
      if(firstNumber == "9" || firstNumber == "8") {
        phoneNumber = `${phoneNumber.substring(4, 0)}${phoneNumber.substring(phoneNumber.length, 5)}`;
      }
    }

  }
  return phoneNumber;
}

const preparePhoneNumber9Digit = (phone:string): string => {
  let phoneNumber = phone.replace('+','');
  let country = phoneNumber.substring(0,2);
  if(country != '55' && phoneNumber.length < 12) {
    phoneNumber = '55' + phoneNumber;
  }

  if (phoneNumber.length < 13){
    phoneNumber = `${phoneNumber.substring(4, 0)}9${phoneNumber.substring(phoneNumber.length, 4)}`
  }
  return phoneNumber;
}

const removePhoneNumber9Digit = (phone:string): string => {
  let phoneNumber = phone.replace('+','');
  let country = phoneNumber.substring(0,2);
  if(country != '55' && phoneNumber.length < 12) {
    phoneNumber = '55' + phoneNumber;
  }

  if (phoneNumber.length == 13){
    switch(phoneNumber.substring(5, 6)) {
      case '9':
      case '8':
      case '7':
        phoneNumber = `${phoneNumber.substring(0, 4)}${phoneNumber.substring(5, phoneNumber.length)}`
    }
  }
  return phoneNumber;
}

const removePhoneNumberCountry = (phone:string): string => {
  let phoneNumber = phone.replace('+','');
  let country = phoneNumber.substring(0,2);
  if(country == '55') {
    phoneNumber = phoneNumber.substring(2, phoneNumber.length)
  }
  return phoneNumber;
}

const removePhoneNumberWith9Country = (phone:string): string => {
  let phoneNumber = phone.replace('+','');
  let country = phoneNumber.substring(0,2);
  if(country == '55') {
    phoneNumber = phoneNumber.substring(2, phoneNumber.length)
  }

  if (phoneNumber.length < 11){
    phoneNumber = `${phoneNumber.substring(2, 0)}9${phoneNumber.substring(phoneNumber.length, 2)}`
  }
  return phoneNumber;
}

const removePhoneNumber9DigitCountry = (phone:string): string => {
  let phoneNumber = phone.replace('+','');
  let country = phoneNumber.substring(0,2);
  if(country == '55') {
    phoneNumber = phoneNumber.substring(2, phoneNumber.length)
  }

  phoneNumber = `${phoneNumber.substring(0, 2)}${phoneNumber.substring(3, phoneNumber.length)}`
  return phoneNumber;
}


const isValidHttpUrl = (text: string): any => {
  let url;
  
  try {
    url = new URL(text);
  } catch (_) {
    return false;  
  }

  let isValidUrl = url.protocol === "http:" || url.protocol === "https:";
  if(isValidUrl) {
    let urlSplit = url.toString().split('|');
    if(urlSplit.length > 1) {
      return {
        "url": urlSplit[0],
        "type": urlSplit[1],
        "fileName": urlSplit[2]
      }
    }
    return null;
  }
  return null;
}

const CONSTANT = {
  region: process.env.ENV_AWS_REGION,
  key:  process.env.ENV_AWS_ACCESS_KEY_ID,
  secret: process.env.ENV_AWS_SECRET_ACCESS_KEY
}

const SQS = new AWS.SQS({
  region: CONSTANT.region,
  secretAccessKey:CONSTANT.secret,
  accessKeyId: CONSTANT.key
});	

const sendMessageToSQS = async (params): Promise<void> => {
  return new Promise((resolve, reject) => {
    SQS.sendMessage(params, function(err, data) {
      if (err) console.error('SendWhatsAppMessage - Message could not be sent to SQS')
  
      console.log(' -- SendWhatsAppMessage - Message sent to SQS -- ', params.QueueUrl);
      try {
        setTimeout(function(){
          resolve();
        }, 1000);
      } catch (e) {
        console.log("SendWhatsAppMessage - Message Error", e);
          resolve();
      }
    });
  });
}

export { preparePhoneNumber, preparePhoneNumber9Digit, isValidHttpUrl, removePhoneNumber9Digit,removePhoneNumberCountry,removePhoneNumber9DigitCountry, removePhoneNumberWith9Country, sendMessageToSQS };
