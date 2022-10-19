/*eslint-disable */
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
    phoneNumber = `${phoneNumber.substring(5, 0)}9${phoneNumber.substring(phoneNumber.length, 5)}`
  }
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

export { preparePhoneNumber, preparePhoneNumber9Digit, isValidHttpUrl };
