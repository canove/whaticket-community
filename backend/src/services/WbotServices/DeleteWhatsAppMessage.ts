import { proto, WALegacySocket, WASocket } from "@adiwajshing/baileys";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

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

  const messageToDelete = await GetWbotMessage(ticket, messageId);

  try {
    const wbot = await GetTicketWbot(ticket);
    const messageDelete = messageToDelete as proto.WebMessageInfo;

    if (wbot.type === "legacy") {
      const remoteJid = messageDelete.key.remoteJid as string;
      await (wbot as WALegacySocket).sendMessage(remoteJid, {
        delete: messageDelete.key
      });
    }

    if (wbot.type === "md") {
      const menssageDelete = messageToDelete as Message;

      await (wbot as WASocket).sendMessage(menssageDelete.remoteJid, {
        delete: {
          id: menssageDelete.id,
          remoteJid: menssageDelete.remoteJid,
          participant: menssageDelete.participant,
          fromMe: menssageDelete.fromMe
        }
      });
    }
  } catch (err) {
    console.log(err);
    throw new AppError("ERR_DELETE_WAPP_MSG");
  }
  await message.update({ isDeleted: true });

  return message;
};

export default DeleteWhatsAppMessage;
