import GreetingMessages from "../../database/models/GreetingMessages";
import WhatsappsConfig from "../../database/models/WhatsappsConfig";

const DeleteConfigService = async (id: string | number): Promise<void> => {
  const messages = await GreetingMessages.findAll({
    where: { configId: id }
  });

  messages.forEach(async message => {
    const msg = await GreetingMessages.findOne({
      where: { id: message.id }
    });

    await msg.destroy();
  });

  const config = await WhatsappsConfig.findOne({
    where: { id }
  });

  await config.destroy();
};

export default DeleteConfigService;
