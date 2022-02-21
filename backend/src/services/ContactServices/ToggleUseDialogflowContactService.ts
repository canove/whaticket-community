import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";

interface Request {
  contactId: string;
}

const ToggleUseDialogflowContactService = async ({
  contactId
}: Request): Promise<Contact> => {
  const contact = await Contact.findOne({
    where: { id: contactId },
    attributes: ["id", "useDialogflow"]
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  const useDialogflow = contact.useDialogflow ? false : true;

  await contact.update({
    useDialogflow
  });

  await contact.reload({
    attributes: ["id", "name", "number", "email", "profilePicUrl", "useQueues", "useDialogflow"],
    include: ["extraInfo"]
  });

  return contact;
};

export default ToggleUseDialogflowContactService;
