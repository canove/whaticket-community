import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import { logger } from "../../utils/logger";

const ImportContactsService = async (
  userId: number,
  contactList?: {
    number: string;
    name?: string;
    email?: string;
    extraInfo?: { name: string; value: string }[];
  }[]
): Promise<{
  invalidNumbersArray: string[];
  validNumbersArray: string[];
} | void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(userId);
  const wbot = getWbot(defaultWhatsapp.id);
  let phoneContacts: typeof contactList;
  try {
    if (contactList) {
      phoneContacts = contactList;
    } else {
      phoneContacts = await wbot.getContacts();
    }
  } catch (err) {
    logger.error(`Could not get whatsapp contacts from phone. Err: ${err}`);
  }

  if (phoneContacts) {
    const invalidNumbersArray: string[] = [];
    const validNumbersArray: string[] = [];

    await Promise.all(
      phoneContacts.map(async ({ number, name, email, extraInfo }) => {
        if (!number && name) {
          return invalidNumbersArray.push(name);
        }
        if (!name) {
          name = number;
        }

        if (!/^(55)([1-9]{2})(9?)([0-9]{4})([0-9]{4})$/.test(number)) {
          return invalidNumbersArray.push(number);
        }
        if (number.length >= 13) {
          number = number.replace("9", "");
        }
        const numberExists = await Contact.findOne({
          where: { number }
        });

        if (numberExists || validNumbersArray.includes(number))
          return invalidNumbersArray.push(number);
        validNumbersArray.push(number);
        const contact = await Contact.create({ number, name, email });

        if (extraInfo && extraInfo.length > 0) {
          await Promise.all(
            extraInfo.map(async info => {
              await ContactCustomField.upsert({
                ...info,
                contactId: contact.id
              });
            })
          );
        }
      })
    );
    return { invalidNumbersArray, validNumbersArray };
  }
};

export default ImportContactsService;
