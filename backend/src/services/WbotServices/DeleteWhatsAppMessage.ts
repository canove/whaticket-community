import AppError from "../../errors/AppError.js";
import Message from "../../models/Message.js";
import Ticket from "../../models/Ticket.js";
import { whatsappProvider } from "../../providers/WhatsApp/index.js";

const DeleteWhatsAppMessage = async (messageId: string): Promise<Message> => {
  const message = await Message.findByPk(messageId, {
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new AppError("No message found with this ID.");
  }

  const { ticket } = message;

  const chatId = `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`;

  await whatsappProvider.deleteMessage(
    ticket.whatsappId,
    chatId,
    message.id,
    message.fromMe
  );

  await message.update({ isDeleted: true });

  return message;
};

export default DeleteWhatsAppMessage;
