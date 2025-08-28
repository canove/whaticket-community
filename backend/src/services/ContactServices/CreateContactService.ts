import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";

interface Request {
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: { name: string; value: string }[];
}

const CreateContactService = async ({
  name,
  number,
  email = "",
  extraInfo = []
}: Request): Promise<Contact> => {
  const numberExists = await Contact.findOne({
    where: { number }
  });

  if (numberExists) {
    throw new AppError("ERR_DUPLICATED_CONTACT");
  }

  const contact = await Contact.create(
    {
      name,
      number,
      email,
      extraInfo: extraInfo as ContactCustomField[]
    },
    {
      include: ["extraInfo"]
    }
  );

  return contact;
};

export default CreateContactService;
