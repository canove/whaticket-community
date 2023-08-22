import { Router } from "express";
import isAuth from "../middleware/isAuth";

import WhatsAppSessionController from "../controllers/WhatsAppSessionController";

const whatsappSessionRoutes = Router();

whatsappSessionRoutes.use(isAuth);

whatsappSessionRoutes.post("/whatsappsession/:whatsappId", WhatsAppSessionController.store);
whatsappSessionRoutes.put("/whatsappsession/:whatsappId", WhatsAppSessionController.update);
whatsappSessionRoutes.delete("/whatsappsession/:whatsappId", WhatsAppSessionController.remove);

export default whatsappSessionRoutes;