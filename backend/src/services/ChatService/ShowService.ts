import Chat from "../../models/Chat";
import AppError from "../../errors/AppError";

const ShowService = async (id: string | number): Promise<Chat> => {
  const record = await Chat.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_CHAT_FOUND", 404);
  }

  return record;
};

export default ShowService;
