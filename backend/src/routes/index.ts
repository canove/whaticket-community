import { Router } from "express";

import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
import settingRoutes from "./settingRoutes.js";
import contactRoutes from "./contactRoutes.js";
import ticketRoutes from "./ticketRoutes.js";
import whatsappRoutes from "./whatsappRoutes.js";
import messageRoutes from "./messageRoutes.js";
import whatsappSessionRoutes from "./whatsappSessionRoutes.js";
import queueRoutes from "./queueRoutes.js";
import quickAnswerRoutes from "./quickAnswerRoutes.js";
import apiRoutes from "./apiRoutes.js";

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

export default routes;
