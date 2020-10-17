import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import GetTicketWbot from "./GetTicketWbot";

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

  try {
    const wbot = await GetTicketWbot(ticket);
    wbot.sendSeen(`${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`);
  } catch (err) {
    console.log(
      "Could not mark messages as read. Maybe whatsapp session disconnected?",
      err
    );
  }

  const io = getIO();
  io.to(ticket.status).to("notification").emit("ticket", {
    action: "updateUnread",
    ticketId: ticket.id
  });
};

export default SetTicketMessagesAsRead;
