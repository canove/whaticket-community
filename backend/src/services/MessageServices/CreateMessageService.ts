import Message from "../../models/Message";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface Request {
  ticketId: string;
  messageData: Message;
}

const CreateMessageService = async ({
  messageData,
  ticketId
}: Request): Promise<Message> => {
  const ticket = await ShowTicketService(ticketId);

  if (!ticket) {
    throw new Error("No ticket found with this ID");
  }

  const message = Message.create({ ...messageData, ticketId });

  return message;
};

export default CreateMessageService;
