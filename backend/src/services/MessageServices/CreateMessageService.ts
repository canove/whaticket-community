import { Op, literal } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
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
  console.log(
    "--- CreateMessageService messageData.id: ",
    messageData.id,
    messageData.body
  );

  // Guardar una copia del ID original
  const originalId = messageData.id;

  try {
    let messageAlreadyCreated = await Message.findByPk(originalId);

    if (messageAlreadyCreated) {
      console.log(
        "---- El mensaje ya existe, generando un nuevo ID y marcando como duplicado"
      );
      // Generar un nuevo ID y marcar como duplicado si ya existe
      messageData.id = uuidv4();
      messageData.isDuplicated = true;
    } else {
      console.log("---- El mensaje no existe");
    }

    console.log("--- Creando el mensaje");

    // Crear el mensaje
    await Message.create(messageData);
  } catch (error) {
    console.log("---- Error al crear el mensaje", error);

    // Esperar 200 ms antes de reintentar
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log("---- Reintentando otra vez vez con el id original");

    // Verificar nuevamente con el ID original
    let messageAlreadyCreated2 = await Message.findByPk(originalId);

    if (messageAlreadyCreated2) {
      // Generar un nuevo ID y marcar como duplicado si ya existe
      console.log(
        "---- El mensaje ya existe, generando un nuevo ID y marcando como duplicado"
      );
      messageData.id = uuidv4();
      messageData.isDuplicated = true;
    } else {
      console.log("---- El mensaje no existe");
    }

    // Reintentar la creación del mensaje
    console.log("--- Reintentar Creando el mensaje");
    await Message.create(messageData);
  }

  // Recuperar el mensaje creado

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
            order: [["timestamp", "DESC"]],
            required: false,
            limit: 25,
            separate: true,
            include: [
              {
                model: Contact,
                as: "contact",
                required: false
              }
            ],
            where: {
              isPrivate: {
                [Op.or]: [false, null]
              }
            }
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "name"],
            required: false
          },
          {
            model: User,
            as: "helpUsers",
            required: false
          },
          {
            model: User,
            as: "participantUsers",
            required: false
          },
          {
            model: Message,
            as: "firstClientMessageAfterLastUserMessage",
            attributes: ["id", "body", "timestamp"],
            order: [["timestamp", "ASC"]],
            required: false,
            limit: 1,
            where: {
              isPrivate: {
                [Op.or]: [false, null]
              },
              fromMe: false,
              timestamp: {
                [Op.gt]: literal(
                  `(SELECT MAX(mes.timestamp) FROM Messages mes WHERE mes.ticketId = Message.ticketId AND mes.fromMe = 1 AND (mes.isPrivate = 0 OR mes.isPrivate IS NULL))`
                )
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

  message.ticket.messages?.sort((a, b) => a.timestamp - b.timestamp);

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
