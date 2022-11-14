import { Op } from "sequelize";
import { getIO } from "../../libs/socket";
import Contact from "../../database/models/Contact";
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
      number: {
        [Op.like]: `%${number.substr(5, 8)}%`
     },
   }});

  if (contact) {
    contact.update({ profilePicUrl });

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
