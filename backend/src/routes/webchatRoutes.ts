import { Router } from "express";
import isAuth from "../middleware/isAuth";
import WebchatController from "../controllers/WebchatController";

const webchatRoutes = Router();

// Public webchat endpoints (no auth required)
webchatRoutes.post("/:tenantId/init", WebchatController.initSession);
webchatRoutes.post("/:tenantId/sessions/:sessionId/messages", WebchatController.sendMessage);
webchatRoutes.get("/:tenantId/sessions/:sessionId/messages", WebchatController.getMessages);
webchatRoutes.put("/:tenantId/sessions/:sessionId/visitor", WebchatController.updateVisitorInfo);
webchatRoutes.post("/:tenantId/sessions/:sessionId/activity", WebchatController.updateActivity);
webchatRoutes.post("/:tenantId/sessions/:sessionId/end", WebchatController.endSession);
webchatRoutes.get("/:tenantId/config", WebchatController.getConfig);
webchatRoutes.get("/:tenantId/widget.js", WebchatController.getWidgetScript);

// Admin endpoints (auth required)
webchatRoutes.get("/:tenantId/sessions", isAuth, WebchatController.getActiveSessions);
webchatRoutes.post("/:tenantId/sessions/:sessionId/agent-message", isAuth, WebchatController.sendAgentMessage);
webchatRoutes.get("/:tenantId/stats", isAuth, WebchatController.getSessionStats);

export default webchatRoutes;