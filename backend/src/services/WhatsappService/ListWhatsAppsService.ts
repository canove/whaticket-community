import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";

const listWhatsAppsService = async (): Promise < Whatsapp[] > => {
    const whatsapps: Whatsapp[] = await Whatsapp.findAll({
        include: [{
            model: Queue,
            as: "queues",
            attributes: ["id", "name", "color", "greetingMessage"]
        }]
    });

    return whatsapps;
};

export default listWhatsAppsService;