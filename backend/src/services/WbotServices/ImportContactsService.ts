import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";

const ImportContactsService = async (): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = getWbot(defaultWhatsapp.id);

  let phoneContacts;

  try {
    phoneContacts = await wbot.getContacts();
  } catch (err) {
    throw new AppError(
      "Could not check whatsapp contact. Check connection page."
    );
  }

  await Promise.all(
    phoneContacts.map(async ({ number, name }) => {
      await Contact.create({ number, name });
    })
  );
};

export default ImportContactsService;
