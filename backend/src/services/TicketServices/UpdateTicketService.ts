import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import { getIO } from "../../libs/socket";
import Ticket from "../../database/models/Ticket";
import ShowTicketService from "./ShowTicketService";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";

interface TicketData {
  status?: string;
  userId?: number;
  queueId?: number;
  categoryId?: number;
}

interface Request {
  ticketData: TicketData;
  ticketId: string | number;
  companyId: string | number;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId,
  companyId
}: Request): Promise<Response> => {
  const { status, userId, queueId, categoryId } = ticketData;

  const ticket = await ShowTicketService(ticketId, companyId);
  await SetTicketMessagesAsRead(ticket);

  const oldStatus = ticket.status;
  const oldUserId = ticket.user?.id;

  if (oldStatus === "closed") {
    await CheckContactOpenTickets(ticket.contact.id);
  }

  await ticket.update({
    status,
    queueId,
    userId,
    categoryId,
    finalizedAt: status === "closed" ? new Date() : null
  });

  await ticket.reload();

  const io = getIO();

  if (ticket.status !== oldStatus || ticket.user?.id !== oldUserId) {
    io.to(oldStatus).emit(`ticket${ticket.companyId}`, {
      action: "delete",
      ticketId: ticket.id
    });
  }

  io.to(ticket.status)
    .to("notification")
    .to(ticketId.toString())
    .emit(`ticket${ticket.companyId}`, {
      action: "update",
      ticket
    });

  return { ticket, oldStatus, oldUserId };
};

export default UpdateTicketService;
