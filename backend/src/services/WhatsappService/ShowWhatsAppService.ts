import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import WhatsappQueue from "../../models/WhatsappQueue";

const ShowWhatsAppService = async (id: string | number): Promise<Whatsapp> => {
  const whatsapp = await Whatsapp.findByPk(id, {
    include: [
      {
        model: WhatsappQueue,
        as: "whatsappQueues",
        attributes: ["optionNumber"],
        include: [
          {
            model: Queue,
            as: "queue",
            attributes: ["id", "name", "color", "greetingMessage"]
          }
        ]
      }
    ],
    order: [["whatsappQueues", "optionNumber", "ASC"]]
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  return whatsapp;
};

export default ShowWhatsAppService;
