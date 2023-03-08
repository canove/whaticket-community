import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as GeneralReportController from "../controllers/GeneralReportController";

const generalReportsRoutes = Router();

generalReportsRoutes.get("/generalReport/list", isAuth, GeneralReportController.index);

generalReportsRoutes.get("/generalReport/pdf", isAuth, GeneralReportController.exportPdf);

export default generalReportsRoutes;
