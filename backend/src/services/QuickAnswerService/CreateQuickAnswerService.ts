import AppError from "../../errors/AppError";
import QuickAnswer from "../../models/QuickAnswer";
import User from "../../models/User";

interface Request {
  shortcut: string;
  message: string;
  userIds: number[];
}

const CreateQuickAnswerService = async ({
  shortcut,
  message,
  userIds
}: Request): Promise<QuickAnswer> => {
  const nameExists = await QuickAnswer.findOne({
    where: { shortcut }
  });

  if (nameExists) {
    throw new AppError("ERR__SHORTCUT_DUPLICATED");
  }

  const quickAnswer = await QuickAnswer.create(
    {
      shortcut,
      message
    },
    {
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "profile", "createdAt"]
        }
      ]
    }
  );

  await quickAnswer.$set("users", userIds);
  await quickAnswer.reload();

  return quickAnswer;
};

export default CreateQuickAnswerService;
