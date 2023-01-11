import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as OfficialWhatsappReportController from "../controllers/OfficialWhatsappReportController";

const officialWhatsappReportRoutes = Router();

officialWhatsappReportRoutes.get("/officialWhatsappReports", isAuth, OfficialWhatsappReportController.index);

export default officialWhatsappReportRoutes;
