import { Op } from "sequelize/types";
import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";

interface Request {
  official?: unknown;
}

const ListWhatsAppsService = async ({
  official = false
}: Request): Promise<Whatsapp[]> => {
  let whereCondition = 0;

  if (official === "true") {
    whereCondition = 1;
  }

  const whatsapps = await Whatsapp.findAll({
    where: { official: whereCondition },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      }
    ]
  });

  return whatsapps;
};

export default ListWhatsAppsService;
