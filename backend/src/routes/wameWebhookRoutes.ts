import { Router } from "express";
import * as WameWebhookController from "../controllers/WameWebhookController";

const wameWebhookRoutes = Router();
wameWebhookRoutes.post("/wame/webhook/:whatsappId", WameWebhookController.receive);
export default wameWebhookRoutes;
