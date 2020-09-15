import { Request, Response } from "express";

import ListContactsService from "../services/ContactServices/ListContactsService";
import CreateContactService from "../services/ContactServices/CreateContactService";
import ShowContactService from "../services/ContactServices/ShowContactService";
import UpdateContactService from "../services/ContactServices/UpdateContactService";
import DeleteContactService from "../services/ContactServices/DeleteContactService";

// const Sequelize = require("sequelize");
// const { Op } = require("sequelize");

// const Contact = require("../models/Contact");
// const Whatsapp = require("../models/Whatsapp");
// const ContactCustomField = require("../models/ContactCustomField");

// const { getIO } = require("../libs/socket");
// const { getWbot } = require("../libs/wbot");

type RequestQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as RequestQuery;

  const { contacts, count, hasMore } = await ListContactsService({
    searchParam,
    pageNumber
  });

  return res.json({ contacts, count, hasMore });
};

interface ContactData {
  name: string;
  number: string;
  email?: string;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, number, email }: ContactData = req.body;

  const contact = await CreateContactService({ name, number, email });

  // const defaultWhatsapp = await Whatsapp.findOne({
  //   where: { default: true }
  // });

  // if (!defaultWhatsapp) {
  //   return res
  //     .status(404)
  //     .json({ error: "No default WhatsApp found. Check Connection page." });
  // }

  // const wbot = getWbot(defaultWhatsapp);
  // const io = getIO();

  // try {
  //   const isValidNumber = await wbot.isRegisteredUser(
  //     `${newContact.number}@c.us`
  //   );
  //   if (!isValidNumber) {
  //     return res
  //       .status(400)
  //       .json({ error: "The suplied number is not a valid Whatsapp number" });
  //   }
  // } catch (err) {
  //   console.log(err);
  //   return res.status(500).json({
  //     error: "Could not check whatsapp contact. Check connection page."
  //   });
  // }

  // const profilePicUrl = await wbot.getProfilePicUrl(
  //   `${newContact.number}@c.us`
  // );

  // const contact = await Contact.create(
  //   { ...newContact, profilePicUrl },
  //   {
  //     include: "extraInfo"
  //   }
  // );

  // io.emit("contact", {
  //   action: "create",
  //   contact: contact
  // });

  return res.status(200).json(contact);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;

  const contact = await ShowContactService(contactId);

  return res.status(200).json(contact);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const contactData = req.body;

  const { contactId } = req.params;

  const contact = await UpdateContactService({ contactData, contactId });

  // const io = getIO();
  // const contact = await Contact.findByPk(contactId, {
  //   include: "extraInfo"
  // });

  // if (!contact) {
  //   return res.status(404).json({ error: "No contact found with this ID" });
  // }

  // if (updatedContact.extraInfo) {
  //   await Promise.all(
  //     updatedContact.extraInfo.map(async info => {
  //       await ContactCustomField.upsert({ ...info, contactId: contact.id });
  //     })
  //   );

  //   await Promise.all(
  //     contact.extraInfo.map(async oldInfo => {
  //       let stillExists = updatedContact.extraInfo.findIndex(
  //         info => info.id === oldInfo.id
  //       );

  //       if (stillExists === -1) {
  //         await ContactCustomField.destroy({ where: { id: oldInfo.id } });
  //       }
  //     })
  //   );
  // }

  // await contact.update(updatedContact);

  // io.emit("contact", {
  //   action: "update",
  //   contact: contact
  // });

  return res.status(200).json(contact);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // const io = getIO();
  const { contactId } = req.params;

  await DeleteContactService(contactId);

  // const contact = await Contact.findByPk(contactId);

  // if (!contact) {
  //   return res.status(404).json({ error: "No contact found with this ID" });
  // }

  // await contact.destroy();

  // io.emit("contact", {
  //   action: "delete",
  //   contactId: contactId
  // });

  return res.status(200).json({ message: "Contact deleted" });
};
