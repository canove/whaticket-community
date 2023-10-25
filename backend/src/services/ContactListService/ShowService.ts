import ContactList from "../../models/ContactList";
import AppError from "../../errors/AppError";

const ShowService = async (id: string | number): Promise<ContactList> => {
  const record = await ContactList.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_TICKETNOTE_FOUND", 404);
  }

  return record;
};

export default ShowService;
