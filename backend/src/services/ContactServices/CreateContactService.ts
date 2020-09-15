import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";

interface Request {
  name: string;
  number: string;
  email?: string;
}

const CreateContactService = async ({
  name,
  number,
  email
}: Request): Promise<Contact> => {
  const numberExists = await Contact.findOne({
    where: { number }
  });

  if (numberExists) {
    throw new AppError("A contact with this number already exists.");
  }

  const contact = await Contact.create({
    name,
    number,
    email
  });

  return contact;
};

export default CreateContactService;
