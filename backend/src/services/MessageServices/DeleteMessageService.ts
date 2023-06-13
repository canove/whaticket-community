import axios from "axios";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

const DeleteMessageService =
 async (messageId: string): Promise<Message> => {
  const message = await Message.findByPk(messageId, {
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: [
            {
                model: Whatsapp,
                as: "whatsapp",
                required: true
            },
        ],
        required: true,
      }
    ]
  });

  if (!message) {
    throw new AppError("No message found with this ID.");
  }

  const { ticket } = message;

  await message.update({ isDeleted: true });

  try {
    const DELETE_MESSAGE_URL = "http://omni.kankei.com.br:8080/delete";

    const payload = {
        "session": ticket.whatsapp.name,
        "chatid": message.id
    }

    axios.post(DELETE_MESSAGE_URL, payload, {
        headers: {
            "api-key": process.env.WPPNOF_API_TOKEN,
            "sessionkey": process.env.WPPNOF_SESSION_KEY,
        }
    }).then(async (response) => {
      await message.update({ isDeleted: true });

      const io = getIO();
      io.to(message.ticketId.toString()).emit("appMessage", {
        action: "update",
        message
      });
    }).catch(async (err) => {
      await message.update({ isDeleted: false });

      const io = getIO();
      io.to(message.ticketId.toString()).emit("appMessage", {
        action: "update",
        message
      });
    });
  } catch (err) {
    throw new AppError("ERR_DELETE_WAPP_MSG");
  }

  return message;
};

export default DeleteMessageService;
