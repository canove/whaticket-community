import { Router } from "express";
import isAuth from "../middleware/isAuth";

import WhatsAppSessionController from "../controllers/WhatsAppSessionController";

const whatsappSessionRoutes = Router();

whatsappSessionRoutes.post(
  "/whatsappsession/:whatsappId",
  isAuth,
  WhatsAppSessionController.store
);

whatsappSessionRoutes.post(
  "/whatsappsession/updateWppChatslastMessageTimestamp/:whatsappId",
  isAuth,
  WhatsAppSessionController.updateWppChatslastMessageTimestamp
);

whatsappSessionRoutes.post(
  "/whatsappsession/syncGroupContactsTable/:whatsappId",
  isAuth,
  WhatsAppSessionController.syncGroupContactsTable
);

whatsappSessionRoutes.put(
  "/whatsappsession/:whatsappId",
  isAuth,
  WhatsAppSessionController.update
);

whatsappSessionRoutes.delete(
  "/whatsappsession/:whatsappId",
  isAuth,
  WhatsAppSessionController.remove
);

export default whatsappSessionRoutes;
