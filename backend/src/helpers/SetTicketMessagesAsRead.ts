import axios from "axios";
import { getIO } from "../libs/socket";
import Message from "../database/models/Message";
import Ticket from "../database/models/Ticket";

const SetTicketMessagesAsRead = async (ticket: Ticket): Promise<void> => {
  try {
    const messages = await Message.findAll({
      where: {
        ticketId: ticket.id,
        read: false
      }
    });

    const SEND_SEEN_URL = "http://omni.kankei.com.br:8080/sendSeen";

    for (const message of messages) {
      const payload = {
        "session": ticket.whatsapp.name,
        "chatid": message.id
      }

      const response = await axios.post(SEND_SEEN_URL, payload, {
        headers: {
          "api-key": process.env.WPPNOF_API_TOKEN,
          "sessionkey": process.env.WPPNOF_SESSION_KEY,
        }
      });

      await message.update({ read: true });
    }

    console.log("update ticket ticketMessageAsRead 15");
    await ticket.update({ unreadMessages: 0 });
  
    const io = getIO();
    io.to(ticket.status).to("notification").emit(`ticket${ticket.companyId}`, {
      action: "updateUnread",
      ticketId: ticket.id
    });
  } catch (err) {
    console.log("Error SetTicketMessagesAsRead - Send Seen", err);
  }
};

export default SetTicketMessagesAsRead;
