import AppError from "../../errors/AppError";
import WhatsappsConfig from "../../database/models/WhatsappsConfig";
import GreetingMessages from "../../database/models/GreetingMessages";

const ShowConfigService = async (
  id: string | number
): Promise<WhatsappsConfig> => {
  const config = await WhatsappsConfig.findByPk(id, {
    attributes: ["id", "triggerInterval", "whatsappIds", "interactionPercentage"],
    include: [
      {
        model: GreetingMessages,
        as: "greetingMessages",
        attributes: ["id", "greetingMessage", "configId"]
      }
    ]
  });

  if (!config) {
    throw new AppError("ERR_NO_WHATSAPPCONFIG_FOUND", 404);
  }

  return config;
};

export default ShowConfigService;
