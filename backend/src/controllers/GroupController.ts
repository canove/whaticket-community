import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateContactService from "../services/ContactServices/CreateContactService";

import CreateGroupService from "../services/WbotServices/CreateGroupService";
import RemovePeopleGroupService from "../services/WbotServices/RemovePeopleGroupService";
import GetChatById from "../services/WbotServices/GetChatById";
// import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";

interface ContactData {
  name: string;
  integer: string[];
  isGroup?: boolean;
}

interface RemoveData {
  chatID: string;
  peoples: string[];
}

interface onlyAdminData {
  chatID: string;
  onlyAdminMenssage?: boolean;
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

export const groupRemove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data: RemoveData = req.body;

  const wbot = await GetChatById(data.chatID);

  await RemovePeopleGroupService(data.peoples, wbot);

  return res.status(200).json({ status: "OK" });
};

export const promoveAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data: RemoveData = req.body;

  const wbot = await GetChatById(data.chatID);

  await wbot.promoteParticipants(data.peoples);

  return res.status(200).json({ status: "OK" });
};

export const onlyAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data: onlyAdminData = req.body;

  const wbot = await GetChatById(data.chatID);

  await wbot.setMessagesAdminsOnly(data.onlyAdminMenssage);

  return res.status(200).json({ status: "OK" });
};
