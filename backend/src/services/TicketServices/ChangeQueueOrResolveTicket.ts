import AppError from "../../errors/AppError";
import Ticket from "../../database/models/Ticket";
import Queue from "../../database/models/Queue";
import Message from "../../database/models/Message";

interface Request {
  messageId: string | number;
  queueName: string;
}

const ChangeQueueOrResolveTicketService = async ({
  messageId,
  queueName
}: Request): Promise<Ticket> => {
  const message = await Message.findByPk(messageId);

  if (!message) {
    throw new AppError("ERR_MESSAGE_DO_NOT_EXISTS");
  }

  const ticket = await Ticket.findByPk(message.ticketId);

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

    await ticket.update({
      status: "pending",
      queueId: queue ? queue.id : null
    });
  } else {
    await ticket.update({
      status: "closed",
      finalizedAt: new Date()
    });
  }

  await ticket.reload();

  return ticket;
};

export default ChangeQueueOrResolveTicketService;
