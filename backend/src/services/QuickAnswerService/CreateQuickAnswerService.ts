import AppError from "../../errors/AppError";
import QuickAnswer from "../../models/QuickAnswer";

interface Request {
  shortcut: string;
  message: string;
}

const CreateQuickAnswerService = async ({
  shortcut,
  message
}: Request): Promise<QuickAnswer> => {
  const nameExists = await QuickAnswer.findOne({
    where: { shortcut }
  });

  if (nameExists) {
    throw new AppError("ERR__SHORTCUT_DUPLICATED");
  }

  const quickAnswer = await QuickAnswer.create({ shortcut, message });

  return quickAnswer;
};

export default CreateQuickAnswerService;
