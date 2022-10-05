import GreetingMessages from "../../database/models/GreetingMessages";
import WhatsappsConfig from "../../database/models/WhatsappsConfig";

const ListWhatsConfigService = async (
  companyId: string | number
): Promise<WhatsappsConfig[]> => {
  const config = await WhatsappsConfig.findAll({
    where: { companyId },
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
