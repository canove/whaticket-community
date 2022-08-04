import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";

interface Request {
  official?: boolean;
}

const ListWhatsAppsService = async ({
  official = false
}: Request): Promise<Whatsapp[]> => {
  const whatsapps = await Whatsapp.findAll({
    where: {
      official
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
