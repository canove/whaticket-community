import { getIO } from "../libs/socket";
import Ticket from "../models/Ticket";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";

const UpdateDeletedUserOpenTicketsStatus = async (
  tickets: Ticket[]
): Promise<void> => {
  tickets.forEach(async t => {
    const ticketId = t.id.toString();

    const { ticket, oldStatus } = await UpdateTicketService({
      ticketData: { status: "pending" },
      ticketId
    });

    const io = getIO();
    if (ticket.status !== oldStatus) {
      io.to(oldStatus).emit("ticket", {
        action: "delete",
        ticketId: ticket.id
      });
    }

    io.to(ticket.status).to(ticketId).emit("ticket", {
      action: "updateStatus",
      ticket
    });
  });
};

export default UpdateDeletedUserOpenTicketsStatus;
