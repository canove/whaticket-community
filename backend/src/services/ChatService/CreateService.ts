import Chat from "../../models/Chat";
import ChatUser from "../../models/ChatUser";
import User from "../../models/User";

interface Data {
  ownerId: number;
  companyId: number;
  users: any[];
  title: string;
}

const CreateService = async (data: Data): Promise<Chat> => {
  const { ownerId, companyId, users, title } = data;

  const record = await Chat.create({
    ownerId,
    companyId,
    title
  });

  if (Array.isArray(users) && users.length > 0) {
    await ChatUser.create({ chatId: record.id, userId: ownerId });
    for (let user of users) {
      await ChatUser.create({ chatId: record.id, userId: user.id });
    }
  }

  await record.reload({
    include: [
      { model: ChatUser, as: "users", include: [{ model: User, as: "user" }] },
      { model: User, as: "owner" }
    ]
  });

  return record;
};

export default CreateService;
