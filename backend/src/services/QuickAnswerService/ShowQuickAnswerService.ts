import QuickAnswer from "../../models/QuickAnswer.js";
import AppError from "../../errors/AppError.js";

const ShowQuickAnswerService = async (id: string): Promise<QuickAnswer> => {
  const quickAnswer = await QuickAnswer.findByPk(id);

  if (!quickAnswer) {
    throw new AppError("ERR_NO_QUICK_ANSWERS_FOUND", 404);
  }

  return quickAnswer;
};

export default ShowQuickAnswerService;
