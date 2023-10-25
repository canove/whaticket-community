import AppError from "../../errors/AppError";
import ContactListItem from "../../models/ContactListItem";
import { logger } from "../../utils/logger";
import CheckContactNumber from "../WbotServices/CheckNumber";

interface Data {
  id: number | string;
  name: string;
  number: string;
  email?: string;
}

const UpdateService = async (data: Data): Promise<ContactListItem> => {
  const { id, name, number, email } = data;

  const record = await ContactListItem.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_CONTACTLISTITEM_FOUND", 404);
  }

  await record.update({
    name,
    number,
    email
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

export default UpdateService;
