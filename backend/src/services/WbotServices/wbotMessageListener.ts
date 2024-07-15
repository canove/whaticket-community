import * as Sentry from "@sentry/node";
import { writeFile } from "fs";
import { join } from "path";
import { promisify } from "util";

import WAWebJS, {
  Client,
  MessageAck,
  Contact as WbotContact,
  Message as WbotMessage
} from "whatsapp-web.js";

import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

import { debounce } from "../../helpers/Debounce";
import formatBody from "../../helpers/Mustache";
import { getConnectedUsers } from "../../libs/connectedUsers";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
import timeoutPromise from "../../utils/timeoutPromise";
import verifyPrivateMessage from "../../utils/verifyPrivateMessage";
import ShowChatbotOptionService from "../ChatbotOptionService/ShowChatbotOptionService";
import CreateContactService from "../ContactServices/CreateContactService";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import FindOrCreateTicketLiteService from "../TicketServices/FindOrCreateTicketLiteService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface Session extends Client {
  id?: number;
}

const writeFileAsync = promisify(writeFile);

/**
 * Save or update the contact in the database (name, number, profilePicUrl)
 */
export const verifyContact = async (
  msgContact: WbotContact
): Promise<Contact> => {
  const profilePicUrl = await timeoutPromise(
    msgContact.getProfilePicUrl(),
    200
  );

  const contactData: {
    name: string;
    number: string;
    profilePicUrl?: string;
    isGroup: boolean;
  } = {
    name: msgContact.name || msgContact.pushname || msgContact.id.user,
    number: msgContact.id.user,
    isGroup: msgContact.isGroup
  };

  if (profilePicUrl) {
    contactData.profilePicUrl = profilePicUrl;
  }

  const contact = CreateOrUpdateContactService(contactData);

  return contact;
};

const verifyContactForSyncUnreadMessages = async (
  msgContact: WbotContact
): Promise<Contact> => {
  const contactData: {
    name: string;
    number: string;
    profilePicUrl?: string;
    isGroup: boolean;
  } = {
    name: msgContact.name || msgContact.pushname || msgContact.id.user,
    number: msgContact.id.user,
    isGroup: msgContact.isGroup
  };

  const number = contactData.isGroup
    ? contactData.number
    : contactData.number.replace(/[^0-9]/g, "");

  let contact: Contact | null;

  contact = await Contact.findOne({ where: { number } });

  if (!contact) {
    contactData.profilePicUrl = await msgContact.getProfilePicUrl();

    contact = await Contact.create({
      name: contactData.name,
      number,
      profilePicUrl: contactData.profilePicUrl,
      isGroup: contactData.isGroup,
      email: "",
      extraInfo: []
    });

    const io = getIO();

    io.emit("contact", {
      action: "create",
      contact
    });
  }

  // const contact = CreateOrUpdateContactService(contactData);

  return contact;
};

/**
 * Verify if the message has a quoted message and return it, otherwise return null
 */
const verifyQuotedMessage = async (
  msg: WbotMessage
): Promise<Message | null> => {
  if (!msg.hasQuotedMsg) return null;

  const wbotQuotedMsg = await msg.getQuotedMessage();

  const quotedMsg = await Message.findOne({
    where: { id: wbotQuotedMsg.id.id }
  });

  if (!quotedMsg) return null;

  return quotedMsg;
};

/**
 * Generate random id string for file names, function got from: https://stackoverflow.com/a/1349426/1851801
 */
function makeRandomId(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

/**
 * Create a message in the database with the passed msg and update the ticket lastMessage
 * - download the media, and save it in the public folder
 */
const verifyMediaMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact,
  updateTicketLastMessage = true
): Promise<Message> => {
  const quotedMsg = await verifyQuotedMessage(msg);

  const media = await msg.downloadMedia();

  if (!media) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  let randomId = makeRandomId(5);

  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    media.filename = `${randomId}-${new Date().getTime()}.${ext}`;
  } else {
    media.filename =
      media.filename.split(".").slice(0, -1).join(".") +
      "." +
      randomId +
      "." +
      media.filename.split(".").slice(-1);
  }

  try {
    await writeFileAsync(
      join(__dirname, "..", "..", "..", "public", media.filename),
      media.data,
      "base64"
    );
  } catch (err) {
    Sentry.captureException(err);
    // @ts-ignore
    logger.error(err);
  }

  const messageData = {
    id: msg.id.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg.body || media.filename,
    fromMe: msg.fromMe,
    read: msg.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype.split("/")[0],
    quotedMsgId: quotedMsg?.id,
    timestamp: msg.timestamp
  };

  if (updateTicketLastMessage) {
    await ticket.update({ lastMessage: msg.body || media.filename });
  }
  const newMessage = await CreateMessageService({ messageData });

  return newMessage;
};

/**
 * Create a message in the database with the passed msg and update the ticket lastMessage
 * - If the message is a location, prepare the message to include the location description and gmaps url
 */
export const verifyMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact,
  isPrivate = false,
  updateTicketLastMessage = true
) => {
  if (msg.type === "location") msg = prepareLocation(msg);

  const quotedMsg = await verifyQuotedMessage(msg);

  const messageData = {
    id: msg.id.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg.body,
    fromMe: msg.fromMe,
    mediaType: msg.type,
    read: msg.fromMe,
    quotedMsgId: quotedMsg?.id,
    isPrivate,
    timestamp: msg.timestamp
  };

  if (updateTicketLastMessage) {
    // temporaryly disable ts checks because of type definition bug for Location object
    // @ts-ignore
    await ticket.update({
      lastMessage:
        msg.type === "location"
          ? // @ts-ignore
            msg.location.description
            ? // @ts-ignore
              "Localization - " + msg.location.description.split("\\n")[0]
            : "Localization"
          : msg.body,
      ...(msg.fromMe && !isPrivate && { userHadContact: true })
    });
  }

  await CreateMessageService({ messageData });
};

/**
 * Modify the passed msg object to include the location description and gmaps url and return it
 */
const prepareLocation = (msg: WbotMessage): WbotMessage => {
  let gmapsUrl =
    "https://maps.google.com/maps?q=" +
    msg.location.latitude +
    "%2C" +
    msg.location.longitude +
    "&z=17&hl=pt-BR";

  msg.body = "data:image/png;base64," + msg.body + "|" + gmapsUrl;

  // temporaryly disable ts checks because of type definition bug for Location object
  // @ts-ignore
  msg.body +=
    "|" +
    // @ts-ignore
    (msg.location.description
      ? // @ts-ignore
        msg.location.description
      : msg.location.latitude + ", " + msg.location.longitude);

  return msg;
};

/**
 * Validate if passed message is a option for a queue related to the conection, and assign the ticket to this queue
 * otherwise send the conection welcome message + options
 * - IF the conection has only one queue, assign the ticket to this queue and return
 */
const verifyQueue = async (
  wbot: Session,
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
) => {
  // Get the queues and the welcome message from the conection
  const { queues, greetingMessage } = await ShowWhatsAppService(wbot.id!);

  // IF the conection has only one queue, assign the ticket to this queue and return
  if (queues.length === 1) {
    // console.log("solo se encontro un departamento para este wpp");

    await UpdateTicketService({
      ticketData: { queueId: queues[0].id },
      ticketId: ticket.id
    });

    let body: string;

    if (queues[0].greetingMessage || queues[0].chatbotOptions?.length > 0) {
      if (queues[0].chatbotOptions?.length > 0) {
        let options = "";

        queues[0].chatbotOptions.forEach((chatbotOption, index) => {
          options += `*${chatbotOption.id}* - ${chatbotOption.name}\n`;
        });

        body = formatBody(
          `\u200e${queues[0].greetingMessage}\n${options}`,
          contact
        );
      } else {
        body = formatBody(`\u200e${queues[0].greetingMessage}`, contact);
      }

      const debouncedSentMessage = debounce(
        async () => {
          const sentMessage = await wbot.sendMessage(
            `${contact.number}@c.us`,
            body
          );

          await verifyMessage(sentMessage, ticket, contact);
        },
        3000,
        ticket.id
      );

      debouncedSentMessage();
    }

    if (queues[0].automaticAssignment && queues[0].users.length > 0) {
      // console.log("se asigna automaticamente");

      let choosenQueueUsers = queues[0].users;

      if (!queues[0].automaticAssignmentForOfflineUsers) {
        // console.log("no se asigna a usuarios offline");
        // console.log(getConnectedUsers());

        const connectedUsers = getConnectedUsers();

        choosenQueueUsers = choosenQueueUsers.filter(user =>
          connectedUsers.includes(user.id)
        );
      }

      let choosenQueueUserWithLessTickets = choosenQueueUsers.sort((a, b) => {
        return a.tickets.length - b.tickets.length;
      })[0];

      await UpdateTicketService({
        ticketData: {
          userId: choosenQueueUserWithLessTickets.id,
          status: "open"
        },
        ticketId: ticket.id
      });

      verifyPrivateMessage(
        `Se ha *asignó automáticamente* a ${choosenQueueUserWithLessTickets.name}`,
        ticket,
        ticket.contact
      );
    }

    return;
  }

  // Consider the body msg as the selected option for a queue
  const selectedOption = msg.body;

  // Identify the choosen queue
  const choosenQueue = queues[+selectedOption - 1];

  // IF the choosen queue exists
  // - assign the ticket to this queue, send the queue welcome message with his categories options
  // - and save the send message in the database with verifyMessage()
  // ELSE
  // - send the conection welcome message with his queues options
  // - and save the send message in the database with verifyMessage()
  if (choosenQueue) {
    await UpdateTicketService({
      ticketData: { queueId: choosenQueue.id },
      ticketId: ticket.id
    });

    let body: string;

    if (choosenQueue.chatbotOptions?.length > 0) {
      let options = "";

      choosenQueue.chatbotOptions.forEach((chatbotOption, index) => {
        options += `*${chatbotOption.id}* - ${chatbotOption.name}\n`;
      });

      body = formatBody(
        `\u200e${choosenQueue.greetingMessage}\n${options}`,
        contact
      );
    } else {
      body = formatBody(`\u200e${choosenQueue.greetingMessage}`, contact);
    }

    const debouncedSentMessage = debounce(
      async () => {
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@c.us`,
          body
        );

        await verifyMessage(sentMessage, ticket, contact);
      },
      3000,
      ticket.id
    );

    debouncedSentMessage();

    if (choosenQueue.automaticAssignment && choosenQueue.users.length > 0) {
      // console.log("se asigna automaticamente");

      let choosenQueueUsers = choosenQueue.users;

      if (!choosenQueue.automaticAssignmentForOfflineUsers) {
        // console.log("no se asigna a usuarios offline");
        // console.log(getConnectedUsers());

        const connectedUsers = getConnectedUsers();

        choosenQueueUsers = choosenQueueUsers.filter(user =>
          connectedUsers.includes(user.id)
        );
      }

      let choosenQueueUserWithLessTickets = choosenQueueUsers.sort((a, b) => {
        return a.tickets.length - b.tickets.length;
      })[0];

      await UpdateTicketService({
        ticketData: {
          userId: choosenQueueUserWithLessTickets.id,
          status: "open"
        },
        ticketId: ticket.id
      });

      verifyPrivateMessage(
        `Se ha *asignó automáticamente* a ${choosenQueueUserWithLessTickets.name}`,
        ticket,
        ticket.contact
      );
    }
  } else {
    let options = "";

    queues.forEach((queue, index) => {
      options += `*${index + 1}* - ${queue.name}\n`;
    });

    const body = formatBody(`\u200e${greetingMessage}\n${options}`, contact);

    const debouncedSentMessage = debounce(
      async () => {
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@c.us`,
          body
        );
        verifyMessage(sentMessage, ticket, contact);
      },
      3000,
      ticket.id
    );

    debouncedSentMessage();
  }
};

const isValidMsg = (msg: WbotMessage): boolean => {
  if (msg.from === "status@broadcast") return false;
  if (
    msg.type === "chat" ||
    msg.type === "audio" ||
    msg.type === "ptt" ||
    msg.type === "video" ||
    msg.type === "image" ||
    msg.type === "document" ||
    msg.type === "vcard" ||
    //msg.type === "multi_vcard" ||
    msg.type === "sticker" ||
    msg.type === "location"
  )
    return true;
  return false;
};

const handleMessage = async (
  msg: WbotMessage,
  wbot: Session,
  syncUnreadMessagesProccess = false
): Promise<void> => {
  if (!isValidMsg(msg)) {
    return;
  }

  try {
    let msgContact: WbotContact;
    let groupContact: Contact | undefined;

    // if i sent the message, msgContact is the contact that received the message
    // if i received the message, msgContact is the contact that sent the message
    if (msg.fromMe) {
      // messages sent automatically by wbot have a special character in front of it
      // if so, this message was already been stored in database;
      if (/\u200e/.test(msg.body[0])) return;

      // media messages sent from me from cell phone, first comes with "hasMedia = false" and type = "image/ptt/etc"
      // in this case, return and let this message be handled by "media_uploaded" event, when it will have "hasMedia = true"
      if (
        !msg.hasMedia &&
        msg.type !== "location" &&
        msg.type !== "chat" &&
        msg.type !== "vcard"
        //&& msg.type !== "multi_vcard"
      )
        return;

      msgContact = await wbot.getContactById(msg.to);
    } else {
      msgContact = await msg.getContact();
    }

    const chat = await msg.getChat();

    // if the message is from a group,
    // and i sent the message, groupContact is the contact that received the message
    // and if i received the message, groupContact is the contact that sent the message
    // in any case, save the group contact in the database
    if (chat.isGroup) {
      let msgGroupContact;

      if (msg.fromMe) {
        msgGroupContact = await wbot.getContactById(msg.to);
      } else {
        msgGroupContact = await wbot.getContactById(msg.from);
      }

      groupContact = await verifyContact(msgGroupContact);
    }

    const whatsapp = await ShowWhatsAppService(wbot.id!);

    // if i sent the message, unreadMessages = 0 otherwise unreadMessages = chat.unreadCount
    const unreadMessages = msg.fromMe ? 0 : chat.unreadCount;

    const contact = await verifyContact(msgContact);

    // if the message is the conection farewell message, dont do anything
    if (
      unreadMessages === 0 &&
      whatsapp.farewellMessage &&
      formatBody(whatsapp.farewellMessage, contact) === msg.body
    ) {
      let ticket = await Ticket.findOne({
        where: {
          status: "closed",
          contactId: groupContact ? groupContact.id : contact.id,
          whatsappId: whatsapp.id
        }
      });

      if (ticket) {
        await verifyMessage(msg, ticket, contact);
      }

      return;
    }

    // find, create or update a ticket from the contact or groupContact and from whatsappId
    // always update the ticket unreadMessages
    const ticket = await FindOrCreateTicketService(
      contact,
      wbot.id!,
      unreadMessages,
      groupContact,
      msg.timestamp
    );

    if (msg.hasMedia) {
      await verifyMediaMessage(msg, ticket, contact);
    } else {
      await verifyMessage(msg, ticket, contact);
    }

    // If the message is not from a group or from me,
    // the message ticket has no queue or category,
    // has no user, and the conection has min 1 queues,
    // we considered it as a intro message from a contact, and whe send it a messages to choose a queue and a category

    if (
      !ticket.userHadContact &&
      !chat.isGroup &&
      !msg.fromMe &&
      whatsapp.queues.length >= 1 &&
      !syncUnreadMessagesProccess
    ) {
      if (!ticket.queue) {
        await verifyQueue(wbot, msg, ticket, contact);
      } else {
        const msgBody = msg.body;

        const chatbotOption = await ShowChatbotOptionService(msgBody);

        if (chatbotOption) {
          if (chatbotOption.chatbotOptions.length > 0) {
            let options = "";

            chatbotOption.chatbotOptions.forEach((chatbotOption, index) => {
              options += `*${chatbotOption.id}* - ${chatbotOption.name}\n`;
            });

            const body = formatBody(
              `\u200e${chatbotOption.message}\n${options}`,
              contact
            );

            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );

                await verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );

            debouncedSentMessage();
          } else {
            const body = formatBody(
              `\u200e${chatbotOption.message}\n`,
              contact
            );

            const debouncedSentMessage = debounce(
              async () => {
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@c.us`,
                  body
                );

                await verifyMessage(sentMessage, ticket, contact);
              },
              3000,
              ticket.id
            );

            debouncedSentMessage();
          }
        }
      }
    }

    if (msg.type === "vcard") {
      try {
        const array = msg.body.split("\n");
        const obj = [];
        let contact = "";
        for (let index = 0; index < array.length; index++) {
          const v = array[index];
          const values = v.split(":");
          for (let ind = 0; ind < values.length; ind++) {
            if (values[ind].indexOf("+") !== -1) {
              obj.push({ number: values[ind] });
            }
            if (values[ind].indexOf("FN") !== -1) {
              contact = values[ind + 1];
            }
          }
        }
        for await (const ob of obj) {
          const cont = await CreateContactService({
            name: contact,
            number: ob.number.replace(/\D/g, "")
          });
        }
      } catch (error) {
        console.log(error);
      }
    }

    /* if (msg.type === "multi_vcard") {
      try {
        const array = msg.vCards.toString().split("\n");
        let name = "";
        let number = "";
        const obj = [];
        const conts = [];
        for (let index = 0; index < array.length; index++) {
          const v = array[index];
          const values = v.split(":");
          for (let ind = 0; ind < values.length; ind++) {
            if (values[ind].indexOf("+") !== -1) {
              number = values[ind];
            }
            if (values[ind].indexOf("FN") !== -1) {
              name = values[ind + 1];
            }
            if (name !== "" && number !== "") {
              obj.push({
                name,
                number
              });
              name = "";
              number = "";
            }
          }
        }

        // eslint-disable-next-line no-restricted-syntax
        for await (const ob of obj) {
          try {
            const cont = await CreateContactService({
              name: ob.name,
              number: ob.number.replace(/\D/g, "")
            });
            conts.push({
              id: cont.id,
              name: cont.name,
              number: cont.number
            });
          } catch (error) {
            if (error.message === "ERR_DUPLICATED_CONTACT") {
              const cont = await GetContactService({
                name: ob.name,
                number: ob.number.replace(/\D/g, ""),
                email: ""
              });
              conts.push({
                id: cont.id,
                name: cont.name,
                number: cont.number
              });
            }
          }
        }
        msg.body = JSON.stringify(conts);
      } catch (error) {
        console.log(error);
      }
    } */
  } catch (err) {
    logger.error(`Error handling whatsapp message: Err: ${err}`);
    console.log(err);
    Sentry.captureException(err);
  }
};

const handleMessageForSyncUnreadMessages = async (
  msg: WbotMessage,
  wbot: Session,
  chat: WAWebJS.Chat,
  ignoreMyMessages = true
): Promise<{ ticket: Ticket; contact: Contact } | undefined> => {
  if (!isValidMsg(msg)) {
    return;
  }

  try {
    let msgContact: WbotContact;
    let groupContact: Contact | undefined;

    // if i sent the message, msgContact is the contact that received the message
    // if i received the message, msgContact is the contact that sent the message
    if (msg.fromMe) {
      // messages sent automatically by wbot have a special character in front of it
      // if so, this message was already been stored in database;
      if (ignoreMyMessages) {
        if (/\u200e/.test(msg.body[0])) return;
      }

      // media messages sent from me from cell phone, first comes with "hasMedia = false" and type = "image/ptt/etc"
      // in this case, return and let this message be handled by "media_uploaded" event, when it will have "hasMedia = true"
      if (
        !msg.hasMedia &&
        msg.type !== "location" &&
        msg.type !== "chat" &&
        msg.type !== "vcard"
        //&& msg.type !== "multi_vcard"
      )
        return;

      msgContact = await wbot.getContactById(msg.to);
    } else {
      msgContact = await msg.getContact();
    }

    // if the message is from a group,
    // and i sent the message, groupContact is the contact that received the message
    // and if i received the message, groupContact is the contact that sent the message
    // in any case, save the group contact in the database
    if (chat.isGroup) {
      let msgGroupContact;

      if (msg.fromMe) {
        msgGroupContact = await wbot.getContactById(msg.to);
      } else {
        msgGroupContact = await wbot.getContactById(msg.from);
      }

      groupContact = await verifyContactForSyncUnreadMessages(msgGroupContact);
    }

    // if i sent the message, unreadMessages = 0 otherwise unreadMessages = chat.unreadCount
    const unreadMessages = msg.fromMe ? 0 : chat.unreadCount;

    const contact = await verifyContactForSyncUnreadMessages(msgContact);

    // find, create or update a ticket from the contact or groupContact and from whatsappId
    // always update the ticket unreadMessages
    const ticket = await FindOrCreateTicketLiteService(
      contact,
      wbot.id!,
      unreadMessages,
      groupContact,
      msg.timestamp
    );

    if (msg.hasMedia) {
      await verifyMediaMessage(msg, ticket, contact, false);
    } else {
      await verifyMessage(msg, ticket, contact, false, false);
    }

    return { ticket, contact };
  } catch (err) {
    logger.error(`Error handling whatsapp message: Err: ${err}`);
    console.log(err);
    Sentry.captureException(err);
  }
};

const handleMsgAck = async (msg: WbotMessage, ack: MessageAck) => {
  await new Promise(r => setTimeout(r, 600));

  const io = getIO();

  try {
    const messageToUpdate = await Message.findByPk(msg.id.id, {
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        }
      ]
    });
    if (!messageToUpdate) {
      return;
    }

    console.log(
      "-- handleMsgAck -messageToUpdate:",
      messageToUpdate,
      " -ack: ",
      ack
    );

    await messageToUpdate.update({ ack });

    /* io.to(messageToUpdate.ticketId.toString()).emit("appMessage", {
      action: "update",
      message: messageToUpdate
    }); */
    // Define la URL a la que se va a enviar la solicitud
    const url = process.env.NODE_URL + "/toEmit";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: [messageToUpdate.ticketId.toString()],
        event: {
          name: "appMessage",
          data: {
            action: "update",
            message: messageToUpdate
          }
        }
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        console.log("Success:", data);
      })
      .catch(error => {
        console.error("Error:", error);
      });
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling message ack. Err: ${err}`);
  }
};

const wbotMessageListener = (wbot: Session): void => {
  wbot.on("message_create", async msg => {
    handleMessage(msg, wbot);
  });
  wbot.on("media_uploaded", async msg => {
    handleMessage(msg, wbot);
  });
  wbot.on("message_ack", async (msg, ack) => {
    // la libreria a veces envia null como ack y causaba error
    if (ack === null) {
      console.log("____ message_ack EVENT SEND ME NULL, DONT UPDATE MESSAGE");
      return;
    }

    handleMsgAck(msg, ack);
  });
};

export {
  handleMessage,
  handleMessageForSyncUnreadMessages,
  wbotMessageListener
};
