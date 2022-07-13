import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as reportTalkController from "../controllers/reportTalkController";

const reportTalkRoutes = Router();

reportTalkRoutes.get("/report-talk", isAuth, reportTalkController.store);




export default reportTalkRoutes;