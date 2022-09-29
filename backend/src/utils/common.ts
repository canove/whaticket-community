/*eslint-disable */
const preparePhoneNumber = (phone:string): string => {
  let phoneNumber = phone;
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

export { preparePhoneNumber };
