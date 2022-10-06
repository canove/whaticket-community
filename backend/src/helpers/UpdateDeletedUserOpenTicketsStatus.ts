import Ticket from "../database/models/Ticket";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";

const UpdateDeletedUserOpenTicketsStatus = async (
  tickets: Ticket[]
): Promise<void> => {
  tickets.forEach(async t => {
    const ticketId = t.id.toString();

    await UpdateTicketService({
      ticketData: { status: "pending" },
      ticketId,
      companyId: t.companyId
    });
  });
};

export default UpdateDeletedUserOpenTicketsStatus;
