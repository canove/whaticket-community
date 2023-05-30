import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import ListContactsService from "../services/ContactServices/ListContactsService";
import CreateContactService from "../services/ContactServices/CreateContactService";
import ShowContactService from "../services/ContactServices/ShowContactService";
import UpdateContactService from "../services/ContactServices/UpdateContactService";
import DeleteContactService from "../services/ContactServices/DeleteContactService";

import AppError from "../errors/AppError";
import GetContactService from "../services/ContactServices/GetContactService";
import ContactBlacklist from "../database/models/ContactBlacklist";
import BlockOrUnblockContactService from "../services/ContactServices/BlockOrUnblockContactService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type GetContactQuery = {
  name: string;
  number: string;
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

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { contacts, count, hasMore } = await ListContactsService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ contacts, count, hasMore });
};

export const getContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, number } = req.body as GetContactQuery;
  const { companyId } = req.user;

  const contact = await GetContactService({
    name,
    number,
    companyId
  });

  return res.status(200).json(contact);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const newContact: ContactData = req.body;
  newContact.number = newContact.number.replace("+", "").replace(" ", "").replace("(", "").replace(")", "").replace(" ", "").replace("-", "");

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  try {
    await schema.validate(newContact);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (newContact.number.length < 12) {
    throw new AppError("ERR_INVALID_NUMBER");
  }

  // await CheckIsValidContact(newContact.number);
  // const validNumber : any = await CheckContactNumber(newContact.number)

  // const profilePicUrl = await GetProfilePicUrl(validNumber);

  let name = newContact.name;
  let number = newContact.number;
  let companyId = req.user.companyId;
  let email = newContact.email;
  let extraInfo = newContact.extraInfo;

  const contact = await CreateContactService({
    name,
    number,
    companyId,
    email,
    extraInfo,
    // profilePicUrl
  });

  const io = getIO();
  io.emit("contact", {
    action: "create",
    contact
  });

  return res.status(200).json(contact);
};

export const blacklist = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  const blacklist = await ContactBlacklist.findOne({
    where: { contactId, companyId }
  });

  if (blacklist) throw new AppError("NUMBER_ALREADY_ON_BLACKLIST");

  await ContactBlacklist.create({ contactId, companyId });

  return res.status(200).json("OK");
}

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  const contact = await ShowContactService(contactId, companyId);

  return res.status(200).json(contact);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const contactData: ContactData = req.body;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string(),
    number: Yup.string().matches(
      /^\d+$/,
      "Invalid number format. Only numbers is allowed."
    )
  });

  try {
    await schema.validate(contactData);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { contactId } = req.params;

  const contact = await UpdateContactService({ contactData, contactId, companyId });

  const io = getIO();
  io.emit(`contact${companyId}`, {
    action: "update",
    contact
  });

  return res.status(200).json(contact);
};

export const block = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { session } = req.body;
  const { contactId } = req.params;
  const { companyId } = req.user;

  const contact = await BlockOrUnblockContactService({ contactId, session, companyId });

  const io = getIO();
  io.emit(`contact${companyId}`, {
    action: "update",
    contact
  });

  return res.status(200).json(contact);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  await DeleteContactService(contactId, companyId);

  const io = getIO();
  io.emit(`contact${companyId}`, {
    action: "delete",
    contactId
  });

  return res.status(200).json({ message: "Contact deleted" });
};
