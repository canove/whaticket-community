import { getIO } from "../libs/socket";
import Message from "../database/models/Message";
import Ticket from "../database/models/Ticket";

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

  const io = getIO();
  io.to(ticket.status).to("notification").emit(`ticket${ticket.companyId}`, {
    action: "updateUnread",
    ticketId: ticket.id
  });
};

export default SetTicketMessagesAsRead;