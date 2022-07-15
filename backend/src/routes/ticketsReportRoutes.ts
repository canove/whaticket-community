import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as TicketsReportController from "../controllers/TicketsReportController";

const ticketsReportRoutes = Router();

ticketsReportRoutes.get("/tickets-report", isAuth, TicketsReportController.index);

export default ticketsReportRoutes;
