import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets.js";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead.js";
import { getIO } from "../../libs/socket.js";
import Ticket from "../../models/Ticket.js";
import Contact from "../../models/Contact.js";
import Queue from "../../models/Queue.js";
import User from "../../models/User.js";
import Whatsapp from "../../models/Whatsapp.js";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage.js";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService.js";
import ShowTicketService from "./ShowTicketService.js";
import { invalidateTicketCache } from "../MessageServices/CreateMessageService.js";
import { invalidateTicketListCache } from "./ListTicketsService.js";

interface TicketData {
  status?: string;
  userId?: number;
  queueId?: number;
  whatsappId?: number;
  notes?: string;
}

interface Request {
  ticketData: TicketData;
  ticketId: string | number;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId
}: Request): Promise<Response> => {
  const { status, userId, queueId, whatsappId, notes } = ticketData;

  const ticket = await ShowTicketService(ticketId);
  await SetTicketMessagesAsRead(ticket);

  if (whatsappId && ticket.whatsappId !== whatsappId) {
    await CheckContactOpenTickets(ticket.contactId, whatsappId);
  }

  const oldStatus = ticket.status;
  const oldUserId = ticket.user?.id;

  if (oldStatus === "closed") {
    await CheckContactOpenTickets(ticket.contact.id, ticket.whatsappId);
  }

  await ticket.update({
    status,
    queueId,
    userId,
    notes
  });

  if (whatsappId) {
    await ticket.update({
      whatsappId
    });
  }

  await ticket.reload({
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"]
      },
      { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["name"] },
      { model: User, as: "user", attributes: ["id", "name"] }
    ]
  });

  // Evict cached ticket relations so the next message uses fresh data
  invalidateTicketCache(ticket.id);

  // Evict list cache for the affected user so the next poll sees fresh data
  invalidateTicketListCache(ticket.userId?.toString()).catch(() => {});

  const io = getIO();

  if (ticket.status !== oldStatus || ticket.user?.id !== oldUserId) {
    io.to(oldStatus).emit("ticket", {
      action: "delete",
      ticketId: ticket.id
    });
  }

  io.to(ticket.status)
    .to("notification")
    .to(ticketId.toString())
    .emit("ticket", {
      action: "update",
      ticket
    });

  return { ticket, oldStatus, oldUserId };
};

export default UpdateTicketService;
