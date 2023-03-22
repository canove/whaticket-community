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
import Contact from "../database/models/Contact";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const blacklist = await ContactBlacklist.findAll({
    where: { companyId },
    include: [
        {
            model: Contact,
            as: "contact",
            required: true,
        }
    ]
  });

  return res.status(200).json(blacklist);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  const blacklist = await ContactBlacklist.findOne({
    where: { contactId, companyId }
  });

  if (!blacklist) {
    throw new AppError("ERR_NUMBER_NOT_FOUND_ON_BLACKLIST", 404);
  }

  await blacklist.destroy();

  const io = getIO();
  io.emit(`contactBlacklist${companyId}`, {
    action: "delete",
    contactBlacklistId: blacklist.id
  });

  return res.status(200).json({ message: "Blacklist removed." });
};
