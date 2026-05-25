import { Op } from "sequelize";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp.js";
import { whatsappProvider } from "../../providers/WhatsApp/index.js";
import Contact from "../../models/Contact.js";
import { logger } from "../../utils/logger.js";

const ImportContactsService = async (userId: number): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(userId);

  let phoneContacts;
  try {
    phoneContacts = await whatsappProvider.getContacts(defaultWhatsapp.id);
  } catch (err) {
    logger.error(`Could not get whatsapp contacts from phone. Err: ${err}`);
  }

  if (!phoneContacts || phoneContacts.length === 0) return;

  const validContacts = phoneContacts
    .filter(({ number }) => !!number)
    .map(({ number, name }) => ({ number, name: name || number }));

  if (validContacts.length === 0) return;

  const numbers = validContacts.map(c => c.number);

  const existing = await Contact.findAll({
    where: { number: { [Op.in]: numbers } },
    attributes: ["number"]
  });

  const existingSet = new Set(existing.map(c => c.number));

  const toCreate = validContacts.filter(c => !existingSet.has(c.number));

  if (toCreate.length > 0) {
    await Contact.bulkCreate(toCreate as any[], { ignoreDuplicates: true });
    logger.info(`ImportContacts: criados ${toCreate.length} novos contatos`);
  }
};

export default ImportContactsService;
