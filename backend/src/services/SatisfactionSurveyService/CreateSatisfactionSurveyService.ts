import AppError from "../../errors/AppError";
import SatisfactionSurveys from "../../database/models/SatisfactionSurveys";

interface Request {
  name: string;
  message: string;
  answers: string;
  companyId: number;
}

const CreateSatisfactionSurveyService = async ({
  name,
  message,
  answers,
  companyId,
}: Request): Promise<SatisfactionSurveys> => {
  const nameExists = await SatisfactionSurveys.findOne({
    where: { name, companyId, deletedAt: null }
  });

  if (nameExists) {
    throw new AppError("ERR_NAME_DUPLICATED");
  }

  const quickAnswer = await SatisfactionSurveys.create({
    name,
    message,
    answers,
    companyId
  });

  return quickAnswer;
};

export default CreateSatisfactionSurveyService;
