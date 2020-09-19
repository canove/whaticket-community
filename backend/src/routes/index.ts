import { Router } from "express";

import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import settingRoutes from "./settingRoutes";
import contactRoutes from "./contactRoutes";
import ticketRoutes from "./ticketRoutes";

// const MessagesRoutes = require("./routes/messages");
// const WhatsRoutes = require("./routes/whatsapp");
// const UsersRoutes = require("./routes/users");

const routes = Router();

routes.use(userRoutes);
routes.use("/auth", authRoutes);
routes.use(settingRoutes);
routes.use(contactRoutes);
routes.use(ticketRoutes);
// routes.use(MessagesRoutes);
// routes.use(WhatsRoutes);

export default routes;
