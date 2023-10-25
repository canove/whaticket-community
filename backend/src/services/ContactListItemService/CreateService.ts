import * as Yup from "yup";
import AppError from "../../errors/AppError";
import ContactListItem from "../../models/ContactListItem";
import { logger } from "../../utils/logger";
import CheckContactNumber from "../WbotServices/CheckNumber";

interface Data {
  name: string;
  number: string;
  contactListId: number;
  companyId: number;
  email?: string;
}

const CreateService = async (data: Data): Promise<ContactListItem> => {
  const { name } = data;

  const contactListItemSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "ERR_CONTACTLISTITEM_INVALID_NAME")
      .required("ERR_CONTACTLISTITEM_REQUIRED")
  });

  try {
    await contactListItemSchema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const [record] = await ContactListItem.findOrCreate({
    where: {
      number: data.number,
      companyId: data.companyId,
      contactListId: data.contactListId
    },
    defaults: data
  });

  try {
    const response = await CheckContactNumber(record.number, record.companyId);
    record.isWhatsappValid = response.exists;
    const number = response.jid.replace(/\D/g, "");
    record.number = number;
    await record.save();
  } catch (e) {
    logger.error(`Número de contato inválido: ${record.number}`);
  }

  return record;
};

export default CreateService;
