import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import ShowTicketService from "./ShowTicketService";
import { invalidateTicketCache } from "../MessageServices/CreateMessageService";
import { invalidateTicketListCache } from "./ListTicketsService";

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
