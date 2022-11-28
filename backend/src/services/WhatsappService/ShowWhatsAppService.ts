import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";
import Queue from "../../database/models/Queue";

const ShowWhatsAppService = async (
  id: string | number,
  companyId: string | number
): Promise<Whatsapp> => {
  const whatsapp = await Whatsapp.findOne({
    where: { id, companyId },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      },
    ],
    order: [["queues", "name", "ASC"]]
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  return whatsapp;
};

export default ShowWhatsAppService;
