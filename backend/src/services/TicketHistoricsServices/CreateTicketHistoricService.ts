import Ticket from "../../database/models/Ticket";
import TicketChanges from "../../database/models/TicketChanges";

interface OldTicket {
  oldStatus: string;
  oldUserId: number;
  oldQueueId: number;
}

interface Request {
  ticket: Ticket;
  oldTicket: OldTicket;
  change: string;
  observation?: string;
}

const CreateTicketHistoricService = async ({
  ticket, 
  oldTicket, 
  change,
  observation
}: Request): Promise<void> => {
  await ticket.reload();

  await TicketChanges.create({
    ticketId: ticket.id,
    companyId: ticket.companyId,
    newUserId: ticket.userId,
    newQueueId: ticket.queueId,
    newStatus: ticket.status,
    oldUserId: oldTicket.oldUserId,
    oldQueueId: oldTicket.oldQueueId,
    oldStatus: oldTicket.oldStatus,
    change: change,
    observation: observation,
  });
};

export default CreateTicketHistoricService;
