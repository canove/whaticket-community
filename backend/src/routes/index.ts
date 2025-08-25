import { Router } from "express";

import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import settingRoutes from "./settingRoutes";
import contactRoutes from "./contactRoutes";
import ticketRoutes from "./ticketRoutes";
import whatsappRoutes from "./whatsappRoutes";
import messageRoutes from "./messageRoutes";
import whatsappSessionRoutes from "./whatsappSessionRoutes";
import queueRoutes from "./queueRoutes";
import quickAnswerRoutes from "./quickAnswerRoutes";
import apiRoutes from "./apiRoutes";
import flowRoutes from "./flowRoutes";
import tagRoutes from "./tagRoutes";
import campaignRoutes from "./campaignRoutes";
import integrationRoutes from "./integrationRoutes";
import webchatRoutes from "./webchatRoutes";
import aiSettingsRoutes from "./aiSettingsRoutes";
import analyticsRoutes from "./analyticsRoutes";

const routes = Router();

routes.use(userRoutes);
routes.use("/auth", authRoutes);
routes.use(settingRoutes);
routes.use(contactRoutes);
routes.use(ticketRoutes);
routes.use(whatsappRoutes);
routes.use(messageRoutes);
routes.use(whatsappSessionRoutes);
routes.use(queueRoutes);
routes.use(quickAnswerRoutes);
routes.use("/api/messages", apiRoutes);
routes.use(flowRoutes);
routes.use(tagRoutes);

// New Phase 3 routes
routes.use("/campaigns", campaignRoutes);
routes.use("/integrations", integrationRoutes);
routes.use("/api/webchat", webchatRoutes);

// New Phase 4 routes - AI & Intelligence
routes.use(aiSettingsRoutes);
routes.use(analyticsRoutes);

export default routes;
