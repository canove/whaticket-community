import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import WhatsappQueue from "../../models/WhatsappQueue";

const ListWhatsAppsService = async (): Promise<Whatsapp[]> => {
  const whatsapps = await Whatsapp.findAll({
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

  return whatsapps;
};

export default ListWhatsAppsService;
