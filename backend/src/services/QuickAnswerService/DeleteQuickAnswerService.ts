import QuickAnswer from "../../database/models/QuickAnswer";
import AppError from "../../errors/AppError";

const DeleteQuickAnswerService = async (
  id: string,
  companyId: string | number
): Promise<void> => {
  const quickAnswer = await QuickAnswer.findOne({
    where: { id, companyId }
  });

  if (!quickAnswer) {
    throw new AppError("ERR_NO_QUICK_ANSWER_FOUND", 404);
  }

  await quickAnswer.destroy();
};

export default DeleteQuickAnswerService;
