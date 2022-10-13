import AppError from "../../errors/AppError";
import Ticket from "../../database/models/Ticket";
import Queue from "../../database/models/Queue";

interface Request {
  ticketId: string | number;
  queueName: string;
}

const ChangeQueueOrResolveTicketService = async ({
  ticketId,
  queueName
}: Request): Promise<Ticket> => {
  const ticket = await Ticket.findByPk(ticketId);

  if (!ticket) {
    throw new AppError("ERR_TICKET_DO_NOT_EXISTS");
  }

  if (queueName) {
    const queue = await Queue.findOne({
      where: {
        name: queueName,
        companyId: ticket.id
      }
    });

    ticket.update({
      queueId: queue ? queue.id : null
    });
  } else {
    ticket.update({
      status: "closed",
      finalizedAt: new Date()
    });
  }

  await ticket.reload();

  return ticket;
};

export default ChangeQueueOrResolveTicketService;
