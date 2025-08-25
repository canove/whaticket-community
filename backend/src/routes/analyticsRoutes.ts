import express from "express";
import isAuth from "../middleware/isAuth";
import * as AnalyticsController from "../controllers/AnalyticsController";

const analyticsRoutes = express.Router();

analyticsRoutes.get("/analytics/metrics", isAuth, AnalyticsController.getMetrics);
analyticsRoutes.get("/analytics/kpis", isAuth, AnalyticsController.getKPIs);
analyticsRoutes.post("/analytics/export", isAuth, AnalyticsController.exportReport);

export default analyticsRoutes;