import SatisfactionSurveys from "../../database/models/SatisfactionSurveys";
import AppError from "../../errors/AppError";

const ShowSatisfactionSurveyService = async (
    id: string,
    companyId: string | number
): Promise<SatisfactionSurveys> => {
    const survey = await SatisfactionSurveys.findOne({ 
        where: { id, companyId } 
    });

    if (!survey) {
        throw new AppError("ERR_NO_SURVEY_FOUND", 404);
    }

    return survey;
};

export default ShowSatisfactionSurveyService;
