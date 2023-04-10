import AppError from "../../errors/AppError";
import QuickAnswer from "../../models/QuickAnswer";
import User from "../../models/User";

const DeleteQuickAnswerService = async (id: string): Promise<void> => {
  const quickAnswer = await QuickAnswer.findOne({
    where: { id },
    include: [{ model: User }]
  });

  if (!quickAnswer) {
    throw new AppError("ERR_NO_QUICK_ANSWER_FOUND", 404);
  }

  await quickAnswer.$remove("users", quickAnswer.users);
  await quickAnswer.destroy();
};

export default DeleteQuickAnswerService;
