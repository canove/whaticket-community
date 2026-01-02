import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp.js";
import { getWbot } from "../../libs/wbot.js";
import Contact from "../../models/Contact.js";
import { logger } from "../../utils/logger.js";

const ImportContactsService = async (userId: number): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(userId);

  const wbot = getWbot(defaultWhatsapp.id);

  let phoneContacts;

  try {
    phoneContacts = await wbot.getContacts();
  } catch (err) {
    logger.error(`Could not get whatsapp contacts from phone. Err: ${err}`);
  }

  if (phoneContacts) {
    await Promise.all(
      phoneContacts.map(async ({ number, name }) => {
        if (!number) {
          return null;
        }
        if (!name) {
          name = number;
        }

        const numberExists = await Contact.findOne({
          where: { number }
        });

        if (numberExists) return null;

        return Contact.create({ number, name });
      })
    );
  }
};

export default ImportContactsService;
