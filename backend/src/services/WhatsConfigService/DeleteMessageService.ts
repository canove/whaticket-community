import GreetingMessages from "../../database/models/GreetingMessages";

const DeleteMessageService = async (id: string | number): Promise<void> => {
  const message = await GreetingMessages.findOne({
    where: { id }
  });

  await message.destroy();
};

export default DeleteMessageService;
