import { WAMessage } from "@whiskeysockets/baileys";
import GetWhatsappWbot from "./GetWhatsappWbot";
import GetDefaultWhatsAppByUser from "./GetDefaultWhatsAppByUser";
import Contact from "../models/Contact";

const ForwardMessage = async (toId: string, userId: number, msg: WAMessage) => {
  const whatsapp = await GetDefaultWhatsAppByUser(userId);
  const wbot = await GetWhatsappWbot(whatsapp);
  if (!wbot) {
    console.log("Nao tem wbot");
    return;
  }
  try {
    const contact = await Contact.findByPk(toId);
    if (!contact) return;
    const chatId = `${contact.number}@${
      contact.isGroup ? "g.us" : "s.whatsapp.net"
    }`;
    try {
      msg.message.extendedTextMessage.text = `*${msg.pushName}*:\n${msg.message.extendedTextMessage.text}`;
    } catch (err) {}
    const send = await wbot.sendMessage(chatId, {
      forward: msg,
      force: true
    });
    return send;
  } catch (err) {
    console.log(err);
    return;
  }
};

export default ForwardMessage;