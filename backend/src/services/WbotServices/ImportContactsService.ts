import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";

const ImportContactsService = async (
  userId: number,
  contactList: Array<object>
) => {
  const defaultWhatsapp = await GetDefaultWhatsApp(userId);
  const wbot = getWbot(defaultWhatsapp.id);
  let phoneContacts;
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
    const invalidNumbersArray: (string | number)[] = [];
    const validNumbersArray: (string | number)[] = [];

    await Promise.all(
      phoneContacts.map(
        async ({
          number,
          name,
          email
        }: {
          number: string;
          name: string;
          email: string;
        }) => {
          if (typeof number === "number") {
            number = number.toString();
          }
          if (!number) {
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

          if (numberExists || validNumbersArray.includes(number)) return invalidNumbersArray.push(number);
          validNumbersArray.push(number);
          return Contact.create({ number, name, email });
        }
      )
    );
    return { invalidNumbersArray, validNumbersArray };
  }
};

export default ImportContactsService;
