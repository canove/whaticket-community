import Chat from "../../models/Chat";
import AppError from "../../errors/AppError";

const ShowFromUuidService = async (uuid: string): Promise<Chat> => {
  const record = await Chat.findOne({ where: { uuid } });

  if (!record) {
    throw new AppError("ERR_NO_CHAT_FOUND", 404);
  }

  return record;
};

export default ShowFromUuidService;
