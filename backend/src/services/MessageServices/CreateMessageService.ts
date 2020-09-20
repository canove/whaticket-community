import Message from "../../models/Message";
import FindTicketService from "../TicketServices/FindTicketService";

interface Request {
  ticketId: string;
  messageData: Message;
}

const CreateMessageService = async ({
  messageData,
  ticketId
}: Request): Promise<Message> => {
  const ticket = await FindTicketService({ where: { id: +ticketId } });

  if (!ticket) {
    throw new Error("No ticket found with this ID");
  }

  const message = Message.create({ ...messageData, ticketId });

  return message;
};

export default CreateMessageService;
