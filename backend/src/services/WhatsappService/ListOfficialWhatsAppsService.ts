import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";

interface Request {
  companyId: string | number;
  official: string | boolean;
}

const ListWhatsAppsService = async ({
  companyId,
  official
}: Request): Promise<Whatsapp[]> => {
  let isOfficial = "";

  if (official === "true") {
    isOfficial = "1";
  } else {
    isOfficial = "0";
  }

  const whatsapps = await Whatsapp.findAll({
    where: { official: isOfficial, companyId },
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
