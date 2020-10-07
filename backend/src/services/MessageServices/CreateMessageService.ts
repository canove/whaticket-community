import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface MessageData {
  id: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
}
interface Request {
  messageData: MessageData;
}

const CreateMessageService = async ({
  messageData
}: Request): Promise<Message> => {
  const ticket = await ShowTicketService(messageData.ticketId);

  if (!ticket) {
    throw new AppError("No ticket found with this ID", 404);
  }

  await Message.upsert(messageData);

  const message = await Message.findByPk(messageData.id, {
    include: ["contact"]
  });

  if (!message) {
    throw new AppError("Error while creating message on database.", 501);
  }

  return message;
};

export default CreateMessageService;
