import * as Yup from "yup";
import * as Sentry from "@sentry/node";

import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import { logger } from "../../utils/logger";
import Ticket from "../../models/Ticket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";

interface Request {
  id: string;
  fromMe: boolean;
  isGroup: boolean;
  type: string;
  to: string;
  from: string;
  body: string;
  contactName: string;
  contactNumber: string;
}

interface Response {
  success: boolean;
}

const NewMessageWhatsappService = async ({
  id,
  fromMe,
  isGroup,
  type,
  to,
  from,
  body,
  contactName,
  contactNumber
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    id: Yup.string().required(),
    fromMe: Yup.string().required(),
    body: Yup.string().required(),
    from: Yup.string().required(),
    to: Yup.string().required(),
    type: Yup.string().required(),
    isGroup: Yup.boolean().required(),
    contactName: Yup.string().required(),
    contactNumber: Yup.string().required()
  });

  try {
    await schema.validate({
      id,
      fromMe,
      body,
      from,
      to,
      type,
      isGroup,
      contactName,
      contactNumber
    });
  } catch (err) {
    throw new AppError(err.message);
  }
  // eslint-disable-next-line no-use-before-define
  await handleMessage(
    id,
    fromMe,
    body,
    from,
    to,
    type,
    contactName,
    contactNumber,
    isGroup
  );
  return { success: true };
};

const verifyMessage = async (
  msg: {
    id: string;
    fromMe: boolean;
    body: string;
    from: string;
    to: string;
    type: string;
    isGroup: boolean;
  },
  ticket: Ticket,
  contact: Contact
) => {

  const messageData = {
    id: msg.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg.body,
    fromMe: msg.fromMe,
    mediaType: msg.type,
    read: msg.fromMe
  };

  await ticket.update({ lastMessage: msg.body });

  await CreateMessageService({ messageData });
};

const verifyContact = async (
  contactName: string,
  contactNumber: string
): Promise<Contact> => {
  const contactData = {
    name: contactName,
    number: contactNumber,
    isGroup: false
  };

  const contact = CreateOrUpdateContactService(contactData);

  return contact;
};


const handleMessage = async (
  id: string,
  fromMe: boolean,
  body: string,
  from: string,
  to: string,
  type: string,
  contactName: string,
  contactNumber: string,
  isGroup: boolean
): Promise<void> => {
  try {
    const unreadMessages = 1;
    const contact = await verifyContact(contactName, contactNumber);

    const ticket = await FindOrCreateTicketService(contact, 3, unreadMessages);

    if (type !== "text") {
      //await verifyMediaMessage(msg, ticket, contact);
    } else {
      await verifyMessage(
        {
          id,
          fromMe,
          body,
          from,
          to,
          type,
          isGroup
        },
        ticket,
        contact
      );
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling whatsapp message: Err: ${err}`);
  }
};

export default NewMessageWhatsappService;
