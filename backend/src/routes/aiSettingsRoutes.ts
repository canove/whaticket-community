import express from "express";
import isAuth from "../middleware/isAuth";
import * as AISettingsController from "../controllers/AISettingsController";

const aiSettingsRoutes = express.Router();

aiSettingsRoutes.get("/ai-settings", isAuth, AISettingsController.index);
aiSettingsRoutes.put("/ai-settings", isAuth, AISettingsController.update);
aiSettingsRoutes.get("/ai-settings/status", isAuth, AISettingsController.status);
aiSettingsRoutes.post("/ai-settings/test/:service", isAuth, AISettingsController.testConnection);
aiSettingsRoutes.get("/ai-settings/usage", isAuth, AISettingsController.getUsageStats);
aiSettingsRoutes.post("/ai-settings/reset", isAuth, AISettingsController.resetSettings);

export default aiSettingsRoutes;