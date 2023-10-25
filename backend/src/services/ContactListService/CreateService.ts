import * as Yup from "yup";
import AppError from "../../errors/AppError";
import ContactList from "../../models/ContactList";

interface Data {
  name: string;
  companyId: number | string;
}

const CreateService = async (data: Data): Promise<ContactList> => {
  const { name, companyId } = data;

  const ticketnoteSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "ERR_CONTACTLIST_INVALID_NAME")
      .required("ERR_CONTACTLIST_REQUIRED")
  });

  try {
    await ticketnoteSchema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const record = await ContactList.create(data);

  return record;
};

export default CreateService;
