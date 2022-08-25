import express from "express";
import isAuth from "../middleware/isAuth";

import * as WhatsAppConfigController from "../controllers/WhatsAppConfigController";

const whatsappConfigRoutes = express.Router();

whatsappConfigRoutes.get(
  "/whatsconfig/",
  isAuth,
  WhatsAppConfigController.index
);

whatsappConfigRoutes.post(
  "/whatsconfig/",
  isAuth,
  WhatsAppConfigController.store
);

whatsappConfigRoutes.put(
  "/whatsconfig/:configId",
  isAuth,
  WhatsAppConfigController.update
);

whatsappConfigRoutes.delete(
  "/whatsconfig/:configId",
  isAuth,
  WhatsAppConfigController.remove
)

whatsappConfigRoutes.delete(
  "/whatsconfig/deleteMessage/:messageId",
  isAuth,
  WhatsAppConfigController.deleteMessage
);

export default whatsappConfigRoutes;
