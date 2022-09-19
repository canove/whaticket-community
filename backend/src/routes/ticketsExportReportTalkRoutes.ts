import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as TicketsExportReportTalkController from "../controllers/TicketsExportReportTalkController";

const ticketsExportReportTalkRoutes = Router();

ticketsExportReportTalkRoutes.get("/tickets-export-report-talk", isAuth, TicketsExportReportTalkController.index);

export default ticketsExportReportTalkRoutes;
