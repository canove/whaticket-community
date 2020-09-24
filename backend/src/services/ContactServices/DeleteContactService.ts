import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";

const DeleteContactService = async (id: string): Promise<void> => {
  const contact = await Contact.findOne({
    where: { id }
  });

  if (!contact) {
    throw new AppError("No contact found with this ID.", 404);
  }

  await contact.destroy();
};

export default DeleteContactService;
