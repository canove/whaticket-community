import AppError from "../../errors/AppError";
import ContactList from "../../models/ContactList";

interface Data {
  id: number | string;
  name: string;
}

const UpdateService = async (data: Data): Promise<ContactList> => {
  const { id, name } = data;

  const record = await ContactList.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_CONTACTLIST_FOUND", 404);
  }

  await record.update({
    name
  });

  return record;
};

export default UpdateService;
