import * as Sentry from "@sentry/node";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";
import ShowBaileysService from "../BaileysServices/ShowBaileysService";
import CreateContactService from "../ContactServices/CreateContactService";
import { isString, isArray } from "lodash";

const ImportContactsService = async (companyId: number): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(companyId);

  const wbot = getWbot(defaultWhatsapp.id);

  let phoneContacts;

  try {
    if (wbot.type === "legacy") {
      phoneContacts = wbot.store.contacts;
    }
    if (wbot.type === "md") {
      const contactsString = await ShowBaileysService(wbot.id);
      phoneContacts = JSON.parse(JSON.stringify(contactsString.contacts));
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Could not get whatsapp contacts from phone. Err: ${err}`);
  }

  if (phoneContacts && wbot.type === "legacy") {
    await Promise.all(
      Object.values(phoneContacts).map(async ({ id, name }) => {
        if (id === "status@broadcast" || id.split("@")[1] === "g.us") return;
        const number = id.replace(/\D/g, "");

        const numberExists = await Contact.findOne({
          where: { number }
        });

        if (numberExists) return;

        try {
          await CreateContactService({ number, name, companyId });
        } catch (error) {
          Sentry.captureException(error);
          console.log(error);
          logger.warn(
            `Could not get whatsapp contacts from phone. Err: ${error}`
          );
        }
      })
    );
  }

  if (phoneContacts && wbot.type === "md") {
    const phoneContactsList = isString(phoneContacts)
      ? JSON.parse(phoneContacts)
      : phoneContacts;

    if (isArray(phoneContactsList)) {
      phoneContactsList.forEach(async ({ id, name, notify }) => {
        if (id === "status@broadcast" || id.includes("g.us") === "g.us") return;
        const number = id.replace(/\D/g, "");

        const numberExists = await Contact.findOne({
          where: { number, companyId }
        });

        if (!numberExists) {
          try {
            await CreateContactService({
              number,
              name: name || notify,
              companyId
            });
          } catch (error) {
            Sentry.captureException(error);
            console.log(error);
            logger.warn(
              `Could not get whatsapp contacts from phone. Err: ${error}`
            );
          }
        }
      });
    }
  }
};

export default ImportContactsService;
