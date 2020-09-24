import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";

const ShowContactService = async (id: string | number): Promise<Contact> => {
  const user = await Contact.findByPk(id, { include: ["extraInfo"] });

  if (!user) {
    throw new AppError("No contact found with this ID.", 404);
  }

  return user;
};

export default ShowContactService;
