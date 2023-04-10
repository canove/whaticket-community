import AppError from "../../errors/AppError";
import QuickAnswer from "../../models/QuickAnswer";
import User from "../../models/User";

interface QuickAnswerData {
  shortcut?: string;
  message?: string;
  userIds: number[];
}

interface Request {
  quickAnswerData: QuickAnswerData;
  quickAnswerId: string;
}

const UpdateQuickAnswerService = async ({
  quickAnswerData,
  quickAnswerId
}: Request): Promise<QuickAnswer> => {
  const { shortcut, message, userIds } = quickAnswerData;

  const quickAnswer = await QuickAnswer.findOne({
    where: { id: quickAnswerId },
    attributes: ["id", "shortcut", "message"]
  });

  if (!quickAnswer) {
    throw new AppError("ERR_NO_QUICK_ANSWERS_FOUND", 404);
  }

  await quickAnswer.update({
    shortcut,
    message
  });

  await quickAnswer.$set("users", userIds);

  await quickAnswer.reload({
    attributes: ["id", "shortcut", "message"],
    include: [
      {
        model: User,
        attributes: ["id", "name", "email", "profile", "createdAt"]
      }
    ]
  });

  return quickAnswer;
};

export default UpdateQuickAnswerService;
