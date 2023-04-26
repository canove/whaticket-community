import { Router } from "express";

import apiRoutes from "./apiRoutes";
import authRoutes from "./authRoutes";
import contactRoutes from "./contactRoutes";
import messageRoutes from "./messageRoutes";
import queueRoutes from "./queueRoutes";
import quickAnswerRoutes from "./quickAnswerRoutes";
import scheduleRoutes from "./scheduleRoutes";
import settingRoutes from "./settingRoutes";
import ticketRoutes from "./ticketRoutes";
import userRoutes from "./userRoutes";
import whatsappRoutes from "./whatsappRoutes";
import whatsappSessionRoutes from "./whatsappSessionRoutes";

const routes = Router();

routes.use("/api/messages", apiRoutes);
routes.use("/auth", authRoutes);
routes.use(contactRoutes);
routes.use(messageRoutes);
routes.use(queueRoutes);
routes.use(quickAnswerRoutes);
routes.use(scheduleRoutes);
routes.use(settingRoutes);
routes.use(ticketRoutes);
routes.use(userRoutes);
routes.use(whatsappRoutes);
routes.use(whatsappSessionRoutes);

export default routes;
