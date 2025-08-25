import { Router } from "express";
import isAuth from "../middleware/isAuth";
import CampaignController from "../controllers/CampaignController";

const campaignRoutes = Router();

// Campaign CRUD operations
campaignRoutes.post("/", isAuth, CampaignController.create);
campaignRoutes.get("/", isAuth, CampaignController.list);
campaignRoutes.get("/:id", isAuth, CampaignController.show);
campaignRoutes.put("/:id", isAuth, CampaignController.update);
campaignRoutes.delete("/:id", isAuth, CampaignController.delete);

// Campaign execution
campaignRoutes.post("/:id/start", isAuth, CampaignController.start);
campaignRoutes.post("/:id/pause", isAuth, CampaignController.pause);
campaignRoutes.post("/:id/resume", isAuth, CampaignController.resume);

// Campaign statistics and monitoring
campaignRoutes.get("/:id/stats", isAuth, CampaignController.getStats);
campaignRoutes.get("/:id/executions", isAuth, CampaignController.getExecutions);

// Message template preview
campaignRoutes.post("/preview", isAuth, CampaignController.preview);

export default campaignRoutes;