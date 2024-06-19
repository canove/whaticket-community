import { MessageId } from "whatsapp-web.js";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import { verifyMessage } from "../services/WbotServices/wbotMessageListener";

function generateRandomID(length: number) {
  const characters = "0123456789ABCDEF"; // caracteres posibles
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

export default function verifyPrivateMessage(
  bodyMessage: string,
  ticket: Ticket,
  contact: Contact
) {
  const testMessageId: MessageId = {
    id: generateRandomID(20),
    fromMe: true,
    remote: "",
    _serialized: ""
  };

  const privateMessageTimestamp = Math.floor(Date.now() / 1000);

  // @ts-ignore
  const testMessage: WbotMessage = {
    id: testMessageId,
    fromMe: true,
    body: bodyMessage,
    timestamp: privateMessageTimestamp
  };

  verifyMessage(testMessage, ticket, contact, true);

  ticket.update({ lastMessageTimestamp: privateMessageTimestamp });
}
