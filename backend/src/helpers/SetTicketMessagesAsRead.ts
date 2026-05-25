import { getIO } from "../libs/socket.js";
import Message from "../models/Message.js";
import Ticket from "../models/Ticket.js";
import Whatsapp from "../models/Whatsapp.js";
import { logger } from "../utils/logger.js";
import { getProvider } from "../providers/WhatsApp/index.js";
import { buildChatId } from "./buildChatId.js";

const SetTicketMessagesAsRead = async (ticket: Ticket): Promise<void> => {
  await Message.update(
    { read: true },
    {
      where: {
        ticketId: ticket.id,
        read: false
      }
    }
  );

  await ticket.update({ unreadMessages: 0 });

  try {
    if (ticket.whatsappId) {
      const whatsapp =
        ticket.whatsapp || (await Whatsapp.findByPk(ticket.whatsappId));
      const channel = whatsapp?.channel || "whatsapp";
      await getProvider(channel).sendSeen(
        ticket.whatsappId,
        buildChatId(channel, ticket.contact.number, ticket.isGroup)
      );
    }
  } catch (err) {
    logger.warn(
      `Could not mark messages as read. Maybe whatsapp session disconnected? Err: ${err}`
    );
  }

  const io = getIO();
  io.to(ticket.status).to("notification").emit("ticket", {
    action: "updateUnread",
    ticketId: ticket.id
  });
};

export default SetTicketMessagesAsRead;
