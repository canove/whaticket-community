import { Op } from "sequelize";
import { getIO } from "../../libs/socket";
import Contact from "../../database/models/Contact";
import {
  removePhoneNumberWith9Country,
  preparePhoneNumber9Digit,
  removePhoneNumber9Digit,
  removePhoneNumberCountry,
  removePhoneNumber9DigitCountry
} from "../../utils/common";

/*eslint-disable */
interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
  companyId: number;
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  extraInfo = [],
  companyId
}: Request): Promise<Contact> => {
  const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");

  const io = getIO();
  let contact: Contact | null;

  contact = await Contact.findOne({
    where: {
     number: 
        { 
          [Op.or]: [
            removePhoneNumberWith9Country(number),
            preparePhoneNumber9Digit(number),
            removePhoneNumber9Digit(number),
            removePhoneNumberCountry(number),
            removePhoneNumber9DigitCountry(number)
          ],
        }
   }});

  if (contact) {
    const oldName = contact.name;

    console.log("update contact contactService 42");
    await contact.update({ 
      name: name && (name !== "" && name !== "undefined" && name !== "Empty") ? name : oldName,
      profilePicUrl 
    });

    io.emit(`contact${companyId}`, {
      action: "update",
      contact
    });
  } else {
    contact = await Contact.create({
      name,
      number,
      profilePicUrl,
      email,
      isGroup,
      extraInfo,
      companyId
    });

    io.emit(`contact${companyId}`, {
      action: "create",
      contact
    });
  }

  return contact;
};

export default CreateOrUpdateContactService;
