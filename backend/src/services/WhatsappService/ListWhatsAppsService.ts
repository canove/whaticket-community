import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";

const ListWhatsAppsService = async (
  companyId: string | number
): Promise<Whatsapp[]> => {
  const whatsapps = await Whatsapp.findAll({
    where: { companyId, deleted: false },
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
