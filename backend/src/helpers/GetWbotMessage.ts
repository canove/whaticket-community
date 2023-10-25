import { proto, WALegacySocket } from "@adiwajshing/baileys";
import Ticket from "../models/Ticket";
import GetTicketWbot from "./GetTicketWbot";
import AppError from "../errors/AppError";
import GetMessageService from "../services/MessageServices/GetMessagesService";
import Message from "../models/Message";

export const GetWbotMessage = async (
  ticket: Ticket,
  messageId: string
): Promise<proto.WebMessageInfo | Message> => {
  const getSock = await GetTicketWbot(ticket);

  let limit = 20;

  const fetchWbotMessagesGradually = async (): Promise<
    proto.WebMessageInfo | Message | null | undefined
  > => {
    if (getSock.type === "legacy") {
      const wbot: WALegacySocket = getSock;
      const chatMessages = await wbot.fetchMessagesFromWA(
        `${ticket.contact.number}@${
          ticket.isGroup ? "g.us" : "s.whatsapp.net"
        }`,
        limit
      );

      const msgFound = chatMessages.find(msg => msg.key.id === messageId);

      if (!msgFound && limit < 400) {
        limit += 50;
        return fetchWbotMessagesGradually();
      }

      return msgFound;
    }

    if (getSock.type === "md") {
      const msgFound = await GetMessageService({
        id: messageId
      });

      return msgFound;
    }

    return null;
  };

  try {
    const msgFound = await fetchWbotMessagesGradually();

    if (!msgFound) {
      throw new Error("Cannot found message within 100 last messages");
    }

    return msgFound;
  } catch (err) {
    console.log(err);
    throw new AppError("ERR_FETCH_WAPP_MSG");
  }
};

export default GetWbotMessage;
