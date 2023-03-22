import Ticket from "../../database/models/Ticket";
import TicketHistorics from "../../database/models/TicketHistorics";

const CreateTicketHistoricService = async (ticket: Ticket, change: string): Promise<void> => {
  await ticket.reload();

  await TicketHistorics.create({
    ticketId: ticket.id,
    userId: ticket.userId,
    queueId: ticket.queueId,
    companyId: ticket.companyId,
    status: ticket.status,
    acceptedAt: change === "ACCEPT" ? ticket.updatedAt : null,
    transferedAt: change === "TRANSFER" ? ticket.updatedAt : null,
    finalizedAt: change === "FINALIZE" ? ticket.finalizedAt : null,
    reopenedAt: change === "REOPEN" ? ticket.updatedAt : null,
    ticketCreatedAt: change === "CREATE" ? ticket.createdAt : null,
    ticketUpdatedAt: ticket.updatedAt,
  });
};

export default CreateTicketHistoricService;
