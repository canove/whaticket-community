import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateSatisfactionSurveyService from "../services/SatisfactionSurveyService/CreateSatisfactionSurveyService";
import UpdateSatisfactionSurveyService from "../services/SatisfactionSurveyService/UpdateSatisfactionSurveyService";
import ShowSatisfactionSurveyService from "../services/SatisfactionSurveyService/ShowSatisfactionSurveyService";
import ListSatisfactionSurveysService from "../services/SatisfactionSurveyService/ListSatisfactionSurveysService";
import DeleteSatisfactionSurveyService from "../services/SatisfactionSurveyService/DeleteSatisfactionSurveyService";

type IndexQuery = {
    pageNumber: string,
    limit: string,
    deleted: string,
}

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { pageNumber, limit, deleted } = req.query as IndexQuery;
    const { companyId } = req.user;

    const surveys = await ListSatisfactionSurveysService({ companyId, pageNumber, limit, deleted });

    return res.status(200).json(surveys);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    const { name, message, answers } = req.body;
    const { companyId } = req.user;

    const survey = await CreateSatisfactionSurveyService({
        name,
        message,
        answers,
        companyId,
    });

    const io = getIO();
    io.emit(`satisfactionSurvey${companyId}`, {
        action: "update",
        survey
    });

    return res.status(200).json(survey);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
    const { surveyId } = req.params;
    const { companyId } = req.user;

    const survey = await ShowSatisfactionSurveyService(surveyId, companyId);

    return res.status(200).json(survey);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
    const surveyData = req.body;
    const { surveyId } = req.params;
    const { companyId } = req.user;

    const survey = await UpdateSatisfactionSurveyService({ surveyId, surveyData, companyId });

    const io = getIO();
    io.emit(`satisfactionSurvey${companyId}`, {
        action: "update",
        survey
    });

    return res.status(201).json(survey);
};

export const remove = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { surveyId } = req.params;
    const { companyId } = req.user;

    await DeleteSatisfactionSurveyService(surveyId, companyId);

    const io = getIO();
    io.emit(`satisfactionSurvey${companyId}`, {
        action: "delete",
        surveyId: +surveyId
    });

    return res.status(200).send();
};
