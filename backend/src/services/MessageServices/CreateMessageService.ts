import { LRUCache } from "lru-cache";
import { getIO } from "../../libs/socket.js";
import Message from "../../models/Message.js";
import Ticket from "../../models/Ticket.js";
import Whatsapp from "../../models/Whatsapp.js";

interface MessageData {
  id: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  ack?: number;
  quotedMsgId?: string;
}
interface Request {
  messageData: MessageData;
}

// Cache ticket relations (contact, queue, whatsapp) to avoid re-fetching on
// every incoming message for the same active ticket. TTL: 60s.
const ticketRelationsCache = new LRUCache<number, Ticket>({
  max: 500,
  ttl: 60_000
});

export const invalidateTicketCache = (ticketId: number) => {
  ticketRelationsCache.delete(ticketId);
};

const getTicketWithRelations = async (ticketId: number): Promise<Ticket> => {
  const cached = ticketRelationsCache.get(ticketId);
  if (cached) return cached;

  const ticket = await Ticket.findByPk(ticketId, {
    include: [
      "contact",
      "queue",
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["name"]
      }
    ]
  });

  if (!ticket) throw new Error("ERR_TICKET_NOT_FOUND");

  ticketRelationsCache.set(ticketId, ticket);
  return ticket;
};

const CreateMessageService = async ({
  messageData
}: Request): Promise<Message> => {
  await Message.upsert(messageData as any);

  // Fetch message with contact + quoted message (lightweight — no ticket join)
  const message = await Message.findByPk(messageData.id, {
    include: [
      "contact",
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

  // Attach ticket from cache (avoids a full JOIN on every message)
  const ticket = await getTicketWithRelations(messageData.ticketId);
  (message as any).ticket = ticket;

  const io = getIO();
  io.to(message.ticketId.toString())
    .to(ticket.status)
    .to("notification")
    .emit("appMessage", {
      action: "create",
      message,
      ticket,
      contact: ticket.contact
    });

  return message;
};

export default CreateMessageService;
