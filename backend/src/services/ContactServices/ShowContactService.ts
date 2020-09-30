import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";

const ShowContactService = async (id: string | number): Promise<Contact> => {
  const contact = await Contact.findByPk(id, { include: ["extraInfo"] });

  if (!contact) {
    throw new AppError("No contact found with this ID.", 404);
  }

  return contact;
};

export default ShowContactService;
