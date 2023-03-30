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
  messageData?: number;
}
interface Request {
  messageData: MessageData;
}

const CreateMessageService = async ({
  messageData
}: Request): Promise<Message> => {
  if (messageData.fromMe === false) {
    const lastMessage = await Message.findOne({
      where: {
        fromMe: true,
        ticketId: messageData.ticketId,
      },
      order: [["createdAt", "DESC"]]
    });

    if (lastMessage) {
      const now = new Date();
      const lastMessageDate = new Date(lastMessage.createdAt);

      const responseTime = now.getTime() - lastMessageDate.getTime();
      messageData["responseTime"] = responseTime;
    }
  }

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
  if (!messageData.bot && message.ticket.status !== "closed") {
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
