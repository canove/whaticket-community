import QuickAnswer from "../../models/QuickAnswer.js";
import AppError from "../../errors/AppError.js";

const DeleteQuickAnswerService = async (id: string): Promise<void> => {
  const quickAnswer = await QuickAnswer.findOne({
    where: { id }
  });

  if (!quickAnswer) {
    throw new AppError("ERR_NO_QUICK_ANSWER_FOUND", 404);
  }

  await quickAnswer.destroy();
};

export default DeleteQuickAnswerService;
