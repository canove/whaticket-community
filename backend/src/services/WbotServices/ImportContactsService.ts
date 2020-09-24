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
    console.log(
      "Could not get whatsapp contacts from phone. Check connection page.",
      err
    );
  }

  if (phoneContacts) {
    await Promise.all(
      phoneContacts.map(async ({ number, name }) => {
        await Contact.create({ number, name });
      })
    );
  }
};

export default ImportContactsService;
