import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";

const ListWhatsAppsService = async ( official = false ): Promise<Whatsapp[]> => {
  const whatsapps = await Whatsapp.findAll({
    where: {
    official: official
    },
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
