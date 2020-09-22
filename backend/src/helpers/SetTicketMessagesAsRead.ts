import { getIO } from "../libs/socket";
import { getWbot } from "../libs/wbot";
import Message from "../models/Message";
import Ticket from "../models/Ticket";

const SetTicketMessagesAsRead = async (ticket: Ticket): Promise<void> => {
  const wbot = getWbot(ticket.whatsappId);

  await Message.update(
    { read: true },
    {
      where: {
        ticketId: ticket.id,
        read: false
      }
    }
  );

  try {
    await wbot.sendSeen(`${ticket.contact.number}@c.us`);
  } catch (err) {
    console.log(
      "Could not mark messages as read. Maybe whatsapp session disconnected?"
    );
  }

  const io = getIO();
  io.to("notification").emit("ticket", {
    action: "updateUnread",
    ticketId: ticket.id
  });
};

export default SetTicketMessagesAsRead;
