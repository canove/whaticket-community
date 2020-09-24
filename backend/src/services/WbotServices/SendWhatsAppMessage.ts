import { Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";

interface Request {
  body: string;
  ticket: Ticket;
}

const SendWhatsAppMessage = async ({
  body,
  ticket
}: Request): Promise<WbotMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket);

    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@c.us`,
      body
    );

    await ticket.update({ lastMessage: body });
    return sentMessage;
  } catch (err) {
    console.log(err);
    throw new AppError(
      "Could not send whatsapp message. Check connections page."
    );
  }
};

export default SendWhatsAppMessage;
