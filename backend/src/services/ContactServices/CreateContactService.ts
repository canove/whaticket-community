import AppError from "../../errors/AppError";
import Contact from "../../database/models/Contact";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  companyId: number | string;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
}

const CreateContactService = async ({
  name,
  number,
  companyId,
  email = "",
  extraInfo = []
}: Request): Promise<Contact> => {
  const numberExists = await Contact.findOne({
    where: { number, companyId }
  });

  if (numberExists) {
    throw new AppError("ERR_DUPLICATED_CONTACT");
  }

  const contact = await Contact.create(
    {
      name,
      number,
      companyId,
      email,
      extraInfo
    },
    {
      include: ["extraInfo"]
    }
  );

  return contact;
};

export default CreateContactService;
