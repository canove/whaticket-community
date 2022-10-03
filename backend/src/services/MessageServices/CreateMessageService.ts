import { getIO } from "../../libs/socket";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
/*eslint-disable */
interface MessageData {
  id: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  companyId: number;
  bot?: boolean;
}
interface Request {
  messageData: MessageData;
}

const CreateMessageService = async ({
  messageData
}: Request): Promise<Message> => {
  await Message.upsert(messageData);

  const message = await Message.findByPk(messageData.id, {
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
    throw new Error("ERR_CREATING_MESSAGE");
  }
  if (!messageData.bot) {
    const io = getIO();
    io.to(message.ticketId.toString())
      .to(message.ticket.status)
      .to("notification")
      .emit(`appMessage${messageData.companyId}`, {
        action: "create",
        message,
        ticket: message.ticket,
        contact: message.ticket.contact
      });
  }
  return message;
};

export default CreateMessageService;
