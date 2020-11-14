import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import { Op } from "sequelize";
import { subHours } from "date-fns";
import * as Sentry from "@sentry/node";

import {
  Contact as WbotContact,
  Message as WbotMessage,
  MessageAck,
  Client
} from "whatsapp-web.js";

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";

import { getIO } from "../../libs/socket";
import AppError from "../../errors/AppError";
import ShowTicketService from "../TicketServices/ShowTicketService";
import CreateMessageService from "../MessageServices/CreateMessageService";

interface Session extends Client {
  id?: number;
}

const writeFileAsync = promisify(writeFile);

const verifyContact = async (
  msgContact: WbotContact,
  profilePicUrl: string
): Promise<Contact> => {
  const io = getIO();

  let contact = await Contact.findOne({
    where: { number: msgContact.id.user }
  });

  if (contact) {
    await contact.update({ profilePicUrl });

    io.emit("contact", {
      action: "update",
      contact
    });
  } else {
    contact = await Contact.create({
      name: msgContact.name || msgContact.pushname || msgContact.id.user,
      number: msgContact.id.user,
      profilePicUrl
    });

    io.emit("contact", {
      action: "create",
      contact
    });
  }

  return contact;
};

const verifyGroup = async (msgGroupContact: WbotContact) => {
  const profilePicUrl = await msgGroupContact.getProfilePicUrl();

  let groupContact = await Contact.findOne({
    where: { number: msgGroupContact.id.user }
  });
  if (groupContact) {
    await groupContact.update({ profilePicUrl });
  } else {
    groupContact = await Contact.create({
      name: msgGroupContact.name,
      number: msgGroupContact.id.user,
      isGroup: msgGroupContact.isGroup,
      profilePicUrl
    });
    const io = getIO();
    io.emit("contact", {
      action: "create",
      contact: groupContact
    });
  }

  return groupContact;
};

const verifyTicket = async (
  contact: Contact,
  whatsappId: number,
  groupContact?: Contact
): Promise<Ticket> => {
  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending"]
      },
      contactId: groupContact ? groupContact.id : contact.id
    },
    include: ["contact"]
  });

  if (!ticket && groupContact) {
    ticket = await Ticket.findOne({
      where: {
        contactId: groupContact.id
      },
      order: [["createdAt", "DESC"]],
      include: ["contact"]
    });

    if (ticket) {
      await ticket.update({ status: "pending", userId: null });
    }
  }

  if (!ticket) {
    ticket = await Ticket.findOne({
      where: {
        updatedAt: {
          [Op.between]: [+subHours(new Date(), 2), +new Date()]
        },
        contactId: groupContact ? groupContact.id : contact.id
      },
      order: [["updatedAt", "DESC"]],
      include: ["contact"]
    });

    if (ticket) {
      await ticket.update({ status: "pending", userId: null });
    }
  }

  if (!ticket) {
    const { id } = await Ticket.create({
      contactId: groupContact ? groupContact.id : contact.id,
      status: "pending",
      isGroup: !!groupContact,
      whatsappId
    });

    ticket = await ShowTicketService(id);
  }

  return ticket;
};

const verifyMedia = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  let quotedMsg: Message | null = null;

  const media = await msg.downloadMedia();

  if (!media) {
    throw new AppError("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  if (msg.hasQuotedMsg) {
    const wbotQuotedMsg = await msg.getQuotedMessage();

    quotedMsg = await Message.findByPk(wbotQuotedMsg.id.id);
  }

  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    media.filename = `${new Date().getTime()}.${ext}`;
  }

  try {
    await writeFileAsync(
      join(__dirname, "..", "..", "..", "public", media.filename),
      media.data,
      "base64"
    );
  } catch (err) {
    console.log(err);
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
    quotedMsgId: quotedMsg?.id
  };

  const newMessage = await CreateMessageService({ messageData });

  await ticket.update({ lastMessage: msg.body || media.filename });
  return newMessage;
};

const verifyMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
) => {
  let newMessage: Message | null;
  let quotedMsg: Message | null = null;

  if (msg.hasQuotedMsg) {
    const wbotQuotedMsg = await msg.getQuotedMessage();

    quotedMsg = await Message.findByPk(wbotQuotedMsg.id.id);
  }

  if (msg.hasMedia) {
    newMessage = await verifyMedia(msg, ticket, contact);
  } else {
    const messageData = {
      id: msg.id.id,
      ticketId: ticket.id,
      contactId: msg.fromMe ? undefined : contact.id,
      body: msg.body,
      fromMe: msg.fromMe,
      mediaType: msg.type,
      read: msg.fromMe,
      quotedMsgId: quotedMsg?.id
    };

    newMessage = await CreateMessageService({ messageData });
    await ticket.update({ lastMessage: msg.body });
  }

  const io = getIO();
  io.to(ticket.id.toString())
    .to(ticket.status)
    .to("notification")
    .emit("appMessage", {
      action: "create",
      message: newMessage,
      ticket,
      contact
    });
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
    msg.type === "sticker"
  )
    return true;
  return false;
};

const handleMessage = async (
  msg: WbotMessage,
  wbot: Session
): Promise<void> => {
  if (!isValidMsg(msg)) {
    return;
  }

  try {
    let msgContact: WbotContact;
    let groupContact: Contact | undefined;

    if (msg.fromMe) {
      msgContact = await wbot.getContactById(msg.to);

      // media messages sent from me from cell phone, first comes with "hasMedia = false" and type = "image/ptt/etc"
      // the media itself comes on body of message, as base64
      // if this is the case, return and let this media be handled by media_uploaded event
      // it should be improoved to handle the base64 media here in future versions

      if (!msg.hasMedia && msg.type !== "chat" && msg.type !== "vcard") return;
    } else {
      msgContact = await msg.getContact();
    }

    const chat = await msg.getChat();

    if (chat.isGroup) {
      let msgGroupContact;

      if (msg.fromMe) {
        msgGroupContact = await wbot.getContactById(msg.to);
      } else {
        msgGroupContact = await wbot.getContactById(msg.from);
      }

      groupContact = await verifyGroup(msgGroupContact);
    }

    const profilePicUrl = await msgContact.getProfilePicUrl();
    const contact = await verifyContact(msgContact, profilePicUrl);
    const ticket = await verifyTicket(contact, wbot.id!, groupContact);

    await verifyMessage(msg, ticket, contact);
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
  }
};

const handleMsgAck = async (msg: WbotMessage, ack: MessageAck) => {
  await new Promise(r => setTimeout(r, 500));

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
    await messageToUpdate.update({ ack });

    io.to(messageToUpdate.ticketId.toString()).emit("appMessage", {
      action: "update",
      message: messageToUpdate
    });
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
  }
};

const wbotMessageListener = (wbot: Session): void => {
  wbot.on("message_create", async msg => {
    // console.log(msg);
    handleMessage(msg, wbot);
  });

  wbot.on("media_uploaded", async msg => {
    handleMessage(msg, wbot);
  });

  wbot.on("message_ack", async (msg, ack) => {
    handleMsgAck(msg, ack);
  });
};

export { wbotMessageListener, handleMessage };
