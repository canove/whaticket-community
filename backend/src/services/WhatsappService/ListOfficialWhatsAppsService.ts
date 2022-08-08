import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";

const ListWhatsAppsService = async (
  official: string | boolean
): Promise<Whatsapp[]> => {
  let isOfficial = "";

  if (official === "true") {
    isOfficial = "1";
  } else {
    isOfficial = "0";
  }

  const whatsapps = await Whatsapp.findAll({
    where: { official: isOfficial },
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
