import axios from "axios";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";

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

  try {
    const DELETE_MESSAGE_URL = "http://omni.kankei.com.br:8080/delete";

    const payload = {
        "session": ticket.whatsapp.name,
        "chatid": message.id
    }

    const response = await axios.post(DELETE_MESSAGE_URL, payload, {
        headers: {
            "api-key": process.env.WPPNOF_API_TOKEN,
            "sessionkey": process.env.WPPNOF_SESSION_KEY,
        }
    });

    await message.update({ isDeleted: true });
  } catch (err) {
    throw new AppError("ERR_DELETE_WAPP_MSG");
  }

  return message;
};

export default DeleteMessageService;
