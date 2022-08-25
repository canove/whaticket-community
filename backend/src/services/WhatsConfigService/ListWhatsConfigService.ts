import GreetingMessages from "../../database/models/GreetingMessages";
import WhatsappsConfig from "../../database/models/WhatsappsConfig";

const ListWhatsConfigService = async (): Promise<WhatsappsConfig[]> => {
  const config = await WhatsappsConfig.findAll({
    include: [
      {
        model: GreetingMessages,
        as: "greetingMessages",
        attributes: ["id", "greetingMessage", "configId"]
      }
    ]
  });

  return config;
};

export default ListWhatsConfigService;
