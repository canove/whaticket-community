import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";

const FindContactService = async (id: string): Promise<Contact> => {
  const user = await Contact.findOne({
    where: { id },
    attributes: ["id", "name", "number", "email"]
  });

  if (!user) {
    throw new AppError("No contact found with this ID.", 404);
  }

  return user;
};

export default FindContactService;
