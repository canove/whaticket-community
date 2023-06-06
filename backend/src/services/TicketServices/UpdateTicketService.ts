import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import { getIO } from "../../libs/socket";
import Ticket from "../../database/models/Ticket";
import ShowTicketService from "./ShowTicketService";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import CreateTicketHistoricService from "../TicketHistoricsServices/CreateTicketHistoricService";
import ShowUserService from "../UserServices/ShowUserService";
import AppError from "../../errors/AppError";
import Message from "../../database/models/Message";
import TicketChanges from "../../database/models/TicketChanges";
import ShowTaskService from "../TaskServices/ShowTaskService";
import FinalzeTaskService from "../TaskServices/FinalizeTaskService";

interface TicketData {
  status?: string;
  userId?: number;
  queueId?: number;
  categoryId?: number;
  observation?: string;
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
  const { status, userId, queueId, categoryId, observation } = ticketData;

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

  if (ticket.taskId) {
    await FinalzeTaskService({ taskId: ticket.taskId, ticketId: ticket.id, companyId: ticket.companyId });
  }

  console.log("update ticket updateticketservice 43");
  await ticket.update({
    status,
    queueId,
    userId,
    categoryId,
    finalizedAt: status === "closed" ? new Date() : null,
  });

  await ticket.reload();

  const oldTicket = {
    oldStatus: oldStatus,
    oldUserId: oldUserId,
    oldQueueId: oldQueueId,
  }

  if (reopen) {
    await CreateTicketHistoricService({ ticket, oldTicket, observation, change: "REOPEN" }); //* TICKET HISTORIC - REOPEN
  } else if (status === "closed") {
    await CreateTicketHistoricService({ ticket, oldTicket, observation, change: "FINALIZE" }); //* TICKET HISTORIC - FINALIZE
  } else if (oldStatus === "pending" && status === "open") {
    await CreateTicketHistoricService({ ticket, oldTicket, observation, change: "ACCEPT" }); //* TICKET HISTORIC - ACCEPT
  } else if (oldUserId != userId || oldQueueId != queueId) {
    await CreateTicketHistoricService({ ticket, oldTicket, observation, change: "TRANSFER"} ); //* TICKET HISTORIC - TRANSFER
  } else if (oldStatus != status) {
    await CreateTicketHistoricService({ ticket, oldTicket, observation, change: "STATUS" }); //* TICKET HISTORIC - STATUS
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
