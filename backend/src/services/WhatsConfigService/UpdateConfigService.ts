import GreetingMessages from "../../database/models/GreetingMessages";
import WhatsappsConfig from "../../database/models/WhatsappsConfig";
import ShowConfigService from "./ShowConfigService";

interface Request {
  configData: WhatsappsConfig;
  configId: string | number;
}

const UpdateConfigService = async ({
  configData,
  configId,
}: Request): Promise<WhatsappsConfig | undefined> => {
  const config = await ShowConfigService(configId);

  const {
    id,
    triggerInterval,
    whatsappIds,
    active,
    greetingMessages = []
  } = configData;

  await config.update({
    id,
    triggerInterval,
    whatsappIds,
    active
  });

  greetingMessages.forEach(async greetingMessage => {
    if (greetingMessage.id != null) {
      const message = await GreetingMessages.findByPk(greetingMessage.id);
      message.update({
        id: greetingMessage.id,
        greetingMessage: greetingMessage.greetingMessage,
        configId: greetingMessage.configId
      });
    } else {
      await GreetingMessages.create({
        greetingMessage: greetingMessage.greetingMessage,
        configId
      });
    }
  });

  await config.reload();

  return config;
};

export default UpdateConfigService;
