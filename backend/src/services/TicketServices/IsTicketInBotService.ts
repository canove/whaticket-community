import AppError from "../../errors/AppError";
import Ticket from "../../database/models/Ticket";
import Message from "../../database/models/Message";

const IsTicketInBotService = async (messageId: string): Promise<boolean> => {
  const message = await Message.findByPk(messageId);

  if (!message) {
    throw new AppError("ERR_MESSAGE_DO_NOT_EXISTS");
  }

  const ticket = await Ticket.findByPk(message.ticketId);

  if (!ticket) {
    throw new AppError("ERR_TICKET_DO_NOT_EXISTS");
  }

  if (ticket.status === "inbot") {
    return true;
  }

  return false;
};

export default IsTicketInBotService;
