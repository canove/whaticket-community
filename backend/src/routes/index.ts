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
import healthRoutes from "./healthRoutes";
import reportTalkRoutes from "./reportTalkRoutes";
import ticketsReportRoutes from "./ticketsReportRoutes";
import ticketsExportReportRoutes from "./ticketsExportReportRoutes";
import ticketsExportReportTalkRoutes from "./ticketsExportReportTalkRoutes";
import fileRoutes from "./fileRoutes";
import registerRoutes from "./registersRoutes";
import templateRoutes from "./templateRoutes";
import whatsConfigRoutes from "./whatsConfigRoutes";
import companyRoutes from "./companyRoutes";

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
routes.use(healthRoutes);
routes.use("/api/messages", apiRoutes);
routes.use(reportTalkRoutes);
routes.use(ticketsReportRoutes);
routes.use(ticketsExportReportRoutes);
routes.use(ticketsExportReportTalkRoutes);
routes.use(fileRoutes);
routes.use(registerRoutes);
routes.use(templateRoutes);
routes.use(whatsConfigRoutes);
routes.use(companyRoutes);

export default routes;
