import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateContactService from "../services/ContactServices/CreateContactService";

import CreateGroupService from "../services/WbotServices/CreateGroupService";
// import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";

interface ContactData {
  name: string;
  integer: string[];
  isGroup?: boolean;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const newGroup: ContactData = req.body;

  const id = await CreateGroupService(newGroup.name, newGroup.integer);

  // await CheckIsValidContact(newGroup.number);
  // const validNumber: any = await CheckContactNumber(newGroup.number);

  // const profilePicUrl = await GetProfilePicUrl(validNumber);

  const { name, isGroup } = newGroup;
  const number = id;

  const contact = await CreateContactService({
    name,
    number,
    isGroup
  });

  const io = getIO();
  io.emit("contact", {
    action: "create",
    contact
  });

  return res.status(200).json(contact);
};
