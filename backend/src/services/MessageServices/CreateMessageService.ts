import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";

interface MessageData {
  id: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  isPrivate?: boolean;
  isDuplicated?: boolean;
}
interface Request {
  messageData: MessageData;
}

const CreateMessageService = async ({
  messageData
}: Request): Promise<Message> => {
  const meesageAlreadyCreated = await Message.findByPk(messageData.id);

  if (meesageAlreadyCreated) {
    messageData.id = uuidv4();
    messageData.isDuplicated = true;
  }

  await Message.create(messageData);

  const message = await Message.findByPk(messageData.id, {
    include: [
      "contact",
      {
        model: Ticket,
        as: "ticket",
        include: [
          "contact",
          "queue",
          {
            model: Whatsapp,
            as: "whatsapp",
            attributes: ["name"]
          },
          {
            model: Message,
            as: "messages",
            separate: true, // <--- Run separate query
            limit: 1,
            order: [["timestamp", "DESC"]],
            required: false,
            where: {
              isPrivate: {
                [Op.or]: [false, null]
              }
            }
          }
        ]
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

  // const io = getIO();
  /* io.to(message.ticketId.toString())
    .to(message.ticket.status)
    .to("notification")
    .emit("appMessage", {
      action: "create",
      message,
      ticket: message.ticket,
      contact: message.ticket.contact
    }); */
  // Define la URL a la que se va a enviar la solicitud
  const url = process.env.NODE_URL + "/toEmit";
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: [message.ticketId.toString(), message.ticket.status, "notification"],
      event: {
        name: "appMessage",
        data: {
          action: "create",
          message,
          ticket: message.ticket,
          contact: message.ticket.contact
        }
      }
    })
  })
    .then(response => {
      if (!response.ok) {
        console.log("---------- response NOT OK");
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log("------------ Success:", data);
    })
    .catch(error => {
      console.error("Error:", error);
    });

  return message;
};

export default CreateMessageService;
