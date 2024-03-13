import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  email?: string;
  useDialogflow?: boolean;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
}

const CreateContactService = async ({
  name,
  number,
  email = "",
  useDialogflow,
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
      useDialogflow,
      extraInfo
    },
    {
      include: ["extraInfo"]
    }
  );

  return contact;
};

export default CreateContactService;
