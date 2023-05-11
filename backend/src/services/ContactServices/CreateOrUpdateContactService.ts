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
import Ticket from "../../database/models/Ticket";

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
  let where = {
    companyId,
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
  };

  contact = await Contact.findOne({ where });
 
  if (contact) {
    const oldName = contact.name;

    delete where.companyId;
    let oldContact = await Contact.findOne({ where });
    
    //se encontrat ticket com contato errado atualiza os tickets com o novo contato
    if (oldContact) {
      await Ticket.update({ contactId: contact.id }, { where: { companyId: companyId, contactId: oldContact.id}});
    }

    console.log("update contact contactService 42");
    await contact.update({ 
      name: (number && number.length < 15) && (name && name !== "" && name !== "undefined" && name !== "Empty") ? name : oldName,
      profilePicUrl 
    });

    io.emit(`contact${companyId}`, {
      action: "update",
      contact
    });
  } else {
    contact = await Contact.create({
      name: (number.length > 15 && name === "Empty") ? "GRUPO" : name,
      number,
      profilePicUrl,
      email,
      isGroup: number.length > 15,
      extraInfo,
      companyId
    });

    
    delete where.companyId;
    let oldContact = await Contact.findOne({ where });
    
    //se encontrat ticket com contato errado atualiza os tickets com o novo contato
    if (oldContact) {
      await Ticket.update({ contactId: contact.id }, { where: { companyId: companyId, contactId: oldContact.id}});
    }

    io.emit(`contact${companyId}`, {
      action: "create",
      contact
    });
  }

  return contact;
};

export default CreateOrUpdateContactService;
