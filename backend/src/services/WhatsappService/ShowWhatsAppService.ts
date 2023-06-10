import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";
import Queue from "../../database/models/Queue";
import Flows from "../../database/models/Flows";

const ShowWhatsAppService = async (
  id: string | number,
  companyId: string | number,
): Promise<Whatsapp> => {
  let whereCondition = null;

  whereCondition = { id };

  if (companyId !== 1) whereCondition = { companyId };

  const whatsapp = await Whatsapp.findOne({
    where: whereCondition,
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      },
      {
        model: Flows,
        as: "flow",
        attributes: ["name"]
      }
    ],
    order: [["queues", "name", "ASC"]]
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  return whatsapp;
};

export default ShowWhatsAppService;
