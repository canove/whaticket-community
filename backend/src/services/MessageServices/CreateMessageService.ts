import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface MessageData {
  id: string;
  body: string;
  fromMe: boolean;
  read: boolean;
  mediaType: string;
  mediaUrl?: string;
}
interface Request {
  ticketId: string | number;
  messageData: MessageData;
}

const CreateMessageService = async ({
  messageData,
  ticketId
}: Request): Promise<Message> => {
  const ticket = await ShowTicketService(ticketId);

  if (!ticket) {
    throw new AppError("No ticket found with this ID", 404);
  }

  const message: Message = await ticket.$create("message", messageData);

  return message;
};

export default CreateMessageService;
