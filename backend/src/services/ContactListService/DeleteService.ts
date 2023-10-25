import ContactList from "../../models/ContactList";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string): Promise<void> => {
  const record = await ContactList.findOne({
    where: { id }
  });

  if (!record) {
    throw new AppError("ERR_NO_CONTACTLIST_FOUND", 404);
  }

  await record.destroy();
};

export default DeleteService;
