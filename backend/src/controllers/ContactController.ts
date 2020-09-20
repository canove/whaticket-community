import { Request, Response } from "express";

import ListContactsService from "../services/ContactServices/ListContactsService";
import CreateContactService from "../services/ContactServices/CreateContactService";
import FindContactService from "../services/ContactServices/FindContactService";
import UpdateContactService from "../services/ContactServices/UpdateContactService";
import DeleteContactService from "../services/ContactServices/DeleteContactService";

// const { getIO } = require("../libs/socket");
// const { getWbot } = require("../libs/wbot");

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { contacts, count, hasMore } = await ListContactsService({
    searchParam,
    pageNumber
  });

  return res.json({ contacts, count, hasMore });
};

interface ExtraInfo {
  name: string;
  value: string;
}
interface ContactData {
  name: string;
  number: string;
  email?: string;
  extraInfo?: ExtraInfo[];
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, number, email, extraInfo }: ContactData = req.body;

  const contact = await CreateContactService({
    name,
    number,
    email,
    extraInfo
  });

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

  const contact = await FindContactService(contactId);

  return res.status(200).json(contact);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const contactData: ContactData = req.body;

  const { contactId } = req.params;

  const contact = await UpdateContactService({ contactData, contactId });

  // const io = getIO();
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
  const { contactId } = req.params;

  await DeleteContactService(contactId);

  // const io = getIO();
  // io.emit("contact", {
  //   action: "delete",
  //   contactId: contactId
  // });

  return res.status(200).json({ message: "Contact deleted" });
};
