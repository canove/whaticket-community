import Ticket from "../models/Ticket.js";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService.js";

const UpdateDeletedUserOpenTicketsStatus = async (
  tickets: Ticket[]
): Promise<void> => {
  tickets.forEach(async t => {
    const ticketId = t.id.toString();

    await UpdateTicketService({
      ticketData: { status: "pending" },
      ticketId
    });
  });
};

export default UpdateDeletedUserOpenTicketsStatus;
