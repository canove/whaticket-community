import { Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../errors/AppError";
import Ticket from "../models/Ticket";
import GetTicketWbot from "./GetTicketWbot";

export const GetWbotMessage = async (
  ticket: Ticket,
  messageId: string
): Promise<WbotMessage> => {
  const wbot = await GetTicketWbot(ticket);

  const wbotChat = await wbot.getChatById(
    `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`
  );

  let limit = 20;

  const fetchWbotMessagesGradually = async (): Promise<void | WbotMessage> => {
    const chatMessages = await wbotChat.fetchMessages({ limit });

    const msgFound = chatMessages.find(msg => msg.id.id === messageId);

    if (!msgFound && limit < 300) {
      limit += 20;
      return fetchWbotMessagesGradually();
    }

    return msgFound;
  };

  try {
    const msgFound = await fetchWbotMessagesGradually();

    if (!msgFound) {
      throw new Error("Cannot found message within 100 last messages");
    }

    return msgFound;
  } catch (err) {
    console.log("Error fetching wbot message", err);
    throw new AppError("ERR_FETCH_WAPP_MSG");
  }
};

export default GetWbotMessage;
