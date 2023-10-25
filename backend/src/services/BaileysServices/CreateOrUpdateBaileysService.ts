import { Chat, Contact } from "@adiwajshing/baileys";
import Baileys from "../../models/Baileys";
import { isArray } from "lodash";

interface Request {
  whatsappId: number;
  contacts?: Contact[];
  chats?: Chat[];
}

const createOrUpdateBaileysService = async ({
  whatsappId,
  contacts,
  chats
}: Request): Promise<Baileys> => {
  const baileysExists = await Baileys.findOne({
    where: { whatsappId }
  });

  if (baileysExists) {
    const getChats = baileysExists.chats
      ? JSON.parse(JSON.stringify(baileysExists.chats))
      : [];
    const getContacts = baileysExists.contacts
      ? JSON.parse(JSON.stringify(baileysExists.contacts))
      : [];

    if (chats && isArray(getChats)) {
      getChats.push(...chats);
      getChats.sort();
      getChats.filter((v, i, a) => a.indexOf(v) === i);
    }

    if (contacts && isArray(getContacts)) {
      getContacts.push(...contacts);
      getContacts.sort();
      getContacts.filter((v, i, a) => a.indexOf(v) === i);
    }

    const newBaileys = await baileysExists.update({
      chats: JSON.stringify(getChats),
      contacts: JSON.stringify(getContacts)
    });

    return newBaileys;
  }

  const baileys = await Baileys.create({
    whatsappId,
    contacts: JSON.stringify(contacts),
    chats: JSON.stringify(chats)
  });

  return baileys;
};

export default createOrUpdateBaileysService;
