import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as TicketsExportReportController from "../controllers/TicketsExportReportController";

const ticketsExportReportRoutes = Router();

ticketsExportReportRoutes.get("/tickets-export-report", isAuth, TicketsExportReportController.index);

export default ticketsExportReportRoutes;
