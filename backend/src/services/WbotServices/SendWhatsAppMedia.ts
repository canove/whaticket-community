import { MessageMedia, Message as WbotMessage } from "whatsapp-web.js";
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
  const wbot = await GetTicketWbot(ticket);

  const newMedia = MessageMedia.fromFilePath(media.path);

  const mediaUrl = media.filename;

  const sentMessage = await wbot.sendMessage(
    `${ticket.contact.number}@c.us`,
    newMedia
  );

  await ticket.update({ lastMessage: mediaUrl });
  return sentMessage;
};

export default SendWhatsAppMedia;
