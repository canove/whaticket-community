import path from "path";
import fs from "fs";
import { Op } from "sequelize";
import { subHours } from "date-fns";
import Sentry from "@sentry/node";

import {
  Contact as WbotContact,
  Message as WbotMessage
} from "whatsapp-web.js";

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import Whatsapp from "../../models/Whatsapp";

import { getIO } from "../../libs/socket";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import ShowTicketService from "../TicketServices/ShowTicketService";

const verifyContact = async (
  msgContact: WbotContact,
  profilePicUrl: string
): Promise<Contact> => {
  let contact = await Contact.findOne({
    where: { number: msgContact.number }
  });

  if (contact) {
    await contact.update({ profilePicUrl });
  } else {
    contact = await Contact.create({
      name: msgContact.pushname || msgContact.number.toString(),
      number: msgContact.number,
      profilePicUrl
    });
  }

  return contact;
};

const verifyTicket = async (
  contact: Contact,
  whatsappId: number
): Promise<Ticket> => {
  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending"]
      },
      contactId: contact.id
    },
    include: ["contact"]
  });

  if (!ticket) {
    ticket = await Ticket.findOne({
      where: {
        createdAt: {
          [Op.between]: [+subHours(new Date(), 2), +new Date()]
        },
        contactId: contact.id
      },
      order: [["createdAt", "DESC"]],
      include: ["contact"]
    });

    if (ticket) {
      await ticket.update({ status: "pending", userId: null });
    }
  }

  if (!ticket) {
    const { id } = await Ticket.create({
      contactId: contact.id,
      status: "pending",
      whatsappId
    });

    ticket = await ShowTicketService(id);
  }

  return ticket;
};

const handlMedia = async (
  msg: WbotMessage,
  ticket: Ticket
): Promise<Message> => {
  const media = await msg.downloadMedia();

  if (!media) {
    throw new AppError("Cannot download media from whatsapp.");
  }

  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    media.filename = `${new Date().getTime()}.${ext}`;
  }

  fs.writeFile(
    path.join(__dirname, "..", "..", "..", "public", media.filename),
    media.data,
    "base64",
    err => {
      console.log(err);
    }
  );

  const newMessage: Message = await ticket.$create("message", {
    id: msg.id.id,
    body: msg.body || media.filename,
    fromMe: msg.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype.split("/")[0]
  });
  await ticket.update({ lastMessage: msg.body || media.filename });
  return newMessage;
};

const handleMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
) => {
  let newMessage: Message;

  if (msg.hasMedia) {
    newMessage = await handlMedia(msg, ticket);
  } else {
    newMessage = await ticket.$create("message", {
      id: msg.id.id,
      body: msg.body,
      fromMe: msg.fromMe
    });
    await ticket.update({ lastMessage: msg.body });
  }

  const io = getIO();
  io.to(ticket.id.toString()).to("notification").emit("appMessage", {
    action: "create",
    message: newMessage,
    ticket,
    contact
  });
};

const isValidMsg = (msg: WbotMessage): boolean => {
  if (msg.from === "status@broadcast" || msg.author) return false;
  if (
    msg.type === "chat" ||
    msg.type === "audio" ||
    msg.type === "ptt" ||
    msg.type === "video" ||
    msg.type === "image" ||
    msg.type === "document" ||
    msg.type === "vcard"
  )
    return true;
  return false;
};

const wbotMessageListener = (whatsapp: Whatsapp): void => {
  const whatsappId = whatsapp.id;
  const wbot = getWbot(whatsappId);
  const io = getIO();

  if (!wbot) {
    console.log("Wbot not initialized");
    return;
  }

  wbot.on("message_create", async msg => {
    console.log(msg.type);

    if (!isValidMsg(msg)) {
      return;
    }

    try {
      let msgContact: WbotContact;

      if (msg.fromMe) {
        msgContact = await wbot.getContactById(msg.to);
      } else {
        msgContact = await msg.getContact();
      }

      const profilePicUrl = await msgContact.getProfilePicUrl();
      const contact = await verifyContact(msgContact, profilePicUrl);
      const ticket = await verifyTicket(contact, whatsappId);

      // return if message was already created by messageController

      if (msg.fromMe) {
        const alreadyExists = await Message.findOne({
          where: { id: msg.id.id }
        });

        if (alreadyExists) {
          return;
        }
      }

      await handleMessage(msg, ticket, contact);
    } catch (err) {
      Sentry.captureException(err);
      console.log(err);
    }
  });

  wbot.on("message_ack", async (msg, ack) => {
    try {
      const messageToUpdate = await Message.findOne({
        where: { id: msg.id.id }
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
  });
};

export default wbotMessageListener;
