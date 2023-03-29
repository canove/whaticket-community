import SatisfactionSurveys from "../../database/models/SatisfactionSurveys";
import AppError from "../../errors/AppError";

const DeleteSatisfactionSurveyService = async (
    id: string,
    companyId: string | number
): Promise<void> => {
    const survey = await SatisfactionSurveys.findOne({
        where: { id, companyId }
    });

    if (!survey) {
        throw new AppError("ERR_NO_SURVEY_FOUND", 404);
    }

    await survey.update({
        deletedAt: new Date()
    });
};

export default DeleteSatisfactionSurveyService;
