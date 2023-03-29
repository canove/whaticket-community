import SatisfactionSurveys from "../../database/models/SatisfactionSurveys";
import AppError from "../../errors/AppError";

interface SatisfactionSurveyData {
  name?: string;
  message?: string;
  answers?: string;
}

interface Request {
  surveyData: SatisfactionSurveyData;
  surveyId: string;
  companyId: string | number;
}

const UpdateSatisfactionSurveyService = async ({
  surveyData,
  surveyId,
  companyId
}: Request): Promise<SatisfactionSurveys> => {
  const { name, message, answers } = surveyData;

  const survey = await SatisfactionSurveys.findOne({
    where: { id: surveyId, companyId },
    attributes: ["id", "name", "message", "answers"]
  });

  if (!survey) {
    throw new AppError("ERR_NO_SURVEY_FOUND", 404);
  }

  await survey.update({
    name,
    message,
    answers
  });

  await survey.reload({
    attributes: ["id", "name", "message", "answers"]
  });

  return survey;
};

export default UpdateSatisfactionSurveyService;
