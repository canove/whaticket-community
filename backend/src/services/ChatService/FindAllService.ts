import Chat from "../../models/Chat";

const FindAllService = async (): Promise<Chat[]> => {
  const records: Chat[] = await Chat.findAll({
    order: [["createdAt", "DESC"]]
  });
  return records;
};

export default FindAllService;
