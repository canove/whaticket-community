import { Message as WbotMessage } from "whatsapp-web.js";
import Ticket from "../models/Ticket";
import GetTicketWbot from "./GetTicketWbot";
import AppError from "../errors/AppError";

export const GetWbotMessage = async (
  ticket: Ticket,
  messageId: string
): Promise<WbotMessage> => {
  const wbot = await GetTicketWbot(ticket);

  const wbotChat = await wbot.getChatById(
    `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`
  );

  try {
    const chatMessages = await wbotChat.fetchMessages({ limit: 20 });

    const msgToDelete = chatMessages.find(msg => msg.id.id === messageId);

    if (!msgToDelete) {
      throw new AppError("msgNotFound");
    }

    return msgToDelete;
  } catch (err) {
    console.log(err);
    if (err.message === "msgNotFound") {
      throw new AppError(
        "Could not find a message witht this ID in WhatsApp chat."
      );
    }
    throw new AppError(
      "Could not valid WhatsApp contact. Check connections page"
    );
  }
};

export default GetWbotMessage;
