import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import { getIO } from "../../libs/socket";
import Ticket from "../../database/models/Ticket";
import ShowTicketService from "./ShowTicketService";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import CreateTicketHistoricService from "../TicketHistoricsServices/CreateTicketHistoricService";
import ShowUserService from "../UserServices/ShowUserService";
import AppError from "../../errors/AppError";

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
  const oldQueueId = ticket.queueId;

  if (ticket.queueId && oldStatus === "pending" && status === "open") {
    const user = await ShowUserService(userId, companyId);

    const userQueues = user?.queues?.map(queue => queue.id);

    if (!userQueues.includes(ticket.queueId)) {
      throw new AppError("ERR_USER_CANNOT_ACCEPT_TICKETS_FROM_THIS_QUEUE");
    }
  }

  let reopen = false;
  if (oldStatus === "closed") {
    await CheckContactOpenTickets(ticket.contact.id, ticket.companyId);
    reopen = true;
  }

  if ((!reopen) && (status !== "closed") && (!(oldStatus === "pending" && status === "open")) && (oldUserId != userId || oldQueueId != queueId)) {
    // TICKET HISTORIC - TRANSFER
    await CreateTicketHistoricService(ticket, "TRANSFER");
  }

  console.log("update ticket updateticketservice 43");
  await ticket.update({
    status,
    queueId,
    userId,
    categoryId,
    finalizedAt: status === "closed" ? new Date() : null
  });

  await ticket.reload();

  if (reopen) {
    // TICKET HISTORIC - REOPEN
    await CreateTicketHistoricService(ticket, "REOPEN");
  } else if (status === "closed") {
    // TICKET HISTORIC - FINALIZE
    await CreateTicketHistoricService(ticket, "FINALIZE");
  } else if (oldStatus === "pending" && status === "open") {
    // TICKET HISTORIC - ACCEPT
    await CreateTicketHistoricService(ticket, "ACCEPT");
  } else if (oldUserId != userId || oldQueueId != queueId) {
    // TICKET HISTORIC - TRANSFER
    await CreateTicketHistoricService(ticket, "TRANSFER");
  } else {
    // TICKET HISTORIC - UPDATE
    await CreateTicketHistoricService(ticket, "UPDATE");
  }

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
