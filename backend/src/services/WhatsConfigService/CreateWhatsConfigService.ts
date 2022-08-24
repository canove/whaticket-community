import GreetingMessages from "../../database/models/GreetingMessages";
import WhatsappsConfig from "../../database/models/WhatsappsConfig";
import AppError from "../../errors/AppError";

interface Request {
  triggerInterval?: number;
  whatsappIds?: string;
  useGreetingMessages?: boolean;
  greetingMessages?: GreetingMessages[];
}

const CreateWhatsConfigService = async ({
  triggerInterval,
  whatsappIds,
  useGreetingMessages,
  greetingMessages
}: Request): Promise<WhatsappsConfig> => {
  try {
    const config = await WhatsappsConfig.create({
      triggerInterval,
      whatsappIds
    });

    const configId = config.id;

    if (useGreetingMessages) {
      greetingMessages.forEach(async greetingMessage => {
        await GreetingMessages.create({
          greetingMessage: greetingMessage.greetingMessage,
          configId
        });
      });
    }

    return config;
  } catch (err) {
    throw new AppError(err.message);
  }
};

export default CreateWhatsConfigService;
