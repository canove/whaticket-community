import AppError from "../../errors/AppError";
import Ticket from "../../database/models/Ticket";
import Queue from "../../database/models/Queue";
import Message from "../../database/models/Message";
import Contact from "../../database/models/Contact";
import User from "../../database/models/User";
import { getIO } from "../../libs/socket";
import CreateTicketHistoricService from "../TicketHistoricsServices/CreateTicketHistoricService";

interface Request {
  messageId: string | number;
  queueName: string;
}

const ChangeQueueOrResolveTicketService = async ({
  messageId,
  queueName
}: Request): Promise<Ticket> => {
  const message = await Message.findByPk(messageId, {
    include: [
      "contact",
      {
        model: Ticket,
        as: "ticket",
        include: ["contact", "queue"]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new AppError("ERR_MESSAGE_DO_NOT_EXISTS");
  }

  const ticket = await Ticket.findOne({
    where: { id: message.ticketId },
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"],
        include: ["extraInfo"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      }
    ]
  });

  if (!ticket) {
    throw new AppError("ERR_TICKET_DO_NOT_EXISTS");
  }

  if (queueName) {
    const queue = await Queue.findOne({
      where: {
        name: queueName,
        companyId: ticket.companyId
      }
    });

    // TICKET HISTORIC - TRANSFER
    await CreateTicketHistoricService(ticket, "TRANSFER");

    console.log("update ticket changequeueorresolve 71");
    await ticket.update({
      status: "pending",
      queueId: queue ? queue.id : null
    });

    // TICKET HISTORIC - TRANSFER
    await CreateTicketHistoricService(ticket, "TRANSFER");

    const io = getIO();
    io.to(message.ticketId.toString())
      .to(message.ticket.status)
      .to("notification")
      .emit(`appMessage${ticket.companyId}`, {
        action: "create",
        message,
        ticket: message.ticket,
        contact: message.ticket.contact
      });
  } else {
    console.log("update ticket changequeueorresolve 88");
    await ticket.update({
      status: "closed",
      finalizedAt: new Date()
    });

    // TICKET HISTORIC - FINALIZE
    await CreateTicketHistoricService(ticket, "FINALIZE");
  }

  await ticket.reload();

  return ticket;
};

export default ChangeQueueOrResolveTicketService;
