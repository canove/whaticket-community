import AppError from "../../errors/AppError.js";
import Contact from "../../models/Contact.js";
import CreateContactService from "./CreateContactService.js";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
}

const GetContactService = async ({
  name,
  number
}: Request): Promise<Contact> => {
  const numberExists = await Contact.findOne({
    where: { number }
  });

  if (!numberExists) {
    const contact = await CreateContactService({
      name,
      number
    });

    if (contact == null) throw new AppError("CONTACT_NOT_FIND");
    else return contact;
  }

  return numberExists;
};

export default GetContactService;
