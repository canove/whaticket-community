import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as SatisfactionSurveyController from "../controllers/SatisfactionSurveyController";

const satisfactionSurveyRoutes = Router();

satisfactionSurveyRoutes.get("/satisfactionSurvey", isAuth, SatisfactionSurveyController.index);

satisfactionSurveyRoutes.post("/satisfactionSurvey", isAuth, SatisfactionSurveyController.store);

satisfactionSurveyRoutes.get("/satisfactionSurvey/:surveyId", isAuth, SatisfactionSurveyController.show);

satisfactionSurveyRoutes.put("/satisfactionSurvey/:surveyId", isAuth, SatisfactionSurveyController.update);

satisfactionSurveyRoutes.delete("/satisfactionSurvey/:surveyId", isAuth, SatisfactionSurveyController.remove);

export default satisfactionSurveyRoutes;
