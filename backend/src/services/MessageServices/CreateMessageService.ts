import { getIO } from "../../libs/socket";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import { createClient } from "redis";
import Contact from "../../database/models/Contact";
import Whatsapp from "../../database/models/Whatsapp";
import Sessions from "../../database/models/Sessions";
import FileRegister from "../../database/models/FileRegister";
import { Op } from "sequelize";
import { preparePhoneNumber9Digit, removePhoneNumber9Digit, removePhoneNumber9DigitCountry, removePhoneNumberCountry, removePhoneNumberWith9Country } from "../../utils/common";
import SessionMessages from "../../database/models/SessionMessages";
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

  try {
    const client = createClient({
      url: process.env.REDIS_URL
    });

    client.on('error', err => console.log('Create Message - Redis Client Error', err));
    await client.connect();

    const ticket = await Ticket.findOne({
      where: { id: messageData.ticketId },
      attributes: ["id", "contactId", "whatsappId", "companyId"]
    });

    const contact = await Contact.findOne({
      where: { id: ticket.contactId },
      attributes: ["id", "number"]
    });

    const whatsapp = await Whatsapp.findOne({
      where: { id: ticket.whatsappId },
      attributes: ["id", "name", "official"]
    });

    const redisSession = await client.get(`session-${ticket.companyId}-${contact.number}-${whatsapp.name}`); // * session-company-telefone-whatsapp * \\
    
    const now = new Date();
    let isInSession = false;
    let sessionId = null;

    if (redisSession) {
      const session = JSON.parse(redisSession);

      if (new Date(session.expirationDate).getTime() - now.getTime() > 0) {
        isInSession = true;
        sessionId = session.id
      }
    }

    if (!isInSession) {
      let register = null;

      if (messageData.fromMe) {
        const yesteday = new Date();
        yesteday.setDate(yesteday.getDate() - 1);

        register = await FileRegister.findOne({
          where: {
            phoneNumber: 
            { 
              [Op.or]: [
                removePhoneNumberWith9Country(contact.number),
                preparePhoneNumber9Digit(contact.number),
                removePhoneNumber9Digit(contact.number),
                removePhoneNumberCountry(contact.number),
                removePhoneNumber9DigitCountry(contact.number)
              ],
            },
            whatsappId: whatsapp.id,
            companyId: ticket.companyId,
            processedAt: { [Op.between]: [+yesteday, +new Date()] }
          },
          order: [["createdAt", "DESC"]]
        });
      }

      if (!messageData.fromMe || register) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 1);
  
        const sessionData = {
          session: whatsapp.name,
          phoneNumber: contact.number,
          companyId: ticket.companyId,
          type: messageData.fromMe ? "outbound" : "inbound", // * OutBound = Disparo || InBound = Cliente Entra em Contato * \\
          official: whatsapp.official,
          expirationDate
        };

        const session = await Sessions.create(sessionData);
  
        await client.set(`session-${ticket.companyId}-${contact.number}-${whatsapp.name}`, JSON.stringify(session), {
          EX: 86400 // * Existe por 24h
        });
      }
    } else {
      await SessionMessages.create({
        companyId: ticket.companyId,
        sessionId,
        messageId: messageData.id,
        type: messageData.fromMe ? "message-out" : "message-in"
      });
    }

    await client.disconnect();
  } catch (err) {
    console.log("Error Redis Create Message Session", err);
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
