import Chat from "../../models/Chat";
import Company from "../../models/Company";
import User from "../../models/User";

type Params = {
  companyId: number;
  ownerId?: number;
};

const FindService = async ({ ownerId, companyId }: Params): Promise<Chat[]> => {
  const chats: Chat[] = await Chat.findAll({
    where: {
      ownerId,
      companyId
    },
    include: [
      { model: Company, as: "company", attributes: ["id", "name"] },
      { model: User, as: "owner", attributes: ["id", "name"] }
    ],
    order: [["createdAt", "DESC"]]
  });

  return chats;
};

export default FindService;
