import Message from "../../models/Message";

const DeleteMessageService = async (message: Message): Promise<Message> => {
  await message.update({ isDeleted: true });

  return message;
};

export default DeleteMessageService;
