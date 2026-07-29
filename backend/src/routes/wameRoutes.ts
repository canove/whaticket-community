import express from "express";

import isAuth from "../middleware/isAuth";
import * as WameController from "../controllers/WameController";

// Authenticated wame endpoints (the public webhook lives in wameWebhookRoutes).
const wameRoutes = express.Router();

wameRoutes.get(
  "/wame/instance/:whatsappId/info",
  isAuth,
  WameController.instanceInfo
);

export default wameRoutes;
