import { MessageMedia, Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
}

const SendWhatsAppMedia = async ({
  media,
  ticket
}: Request): Promise<WbotMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket);

    const newMedia = MessageMedia.fromFilePath(media.path);

    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@c.us`,
      newMedia
    );

    await ticket.update({ lastMessage: media.filename });
    return sentMessage;
  } catch (err) {
    console.log(err);
    throw new AppError(
      "Could not send whatsapp message. Check connections page."
    );
  }
};

export default SendWhatsAppMedia;
