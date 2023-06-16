import express from "express";
import isAuth from "../middleware/isAuth";

import * as WhatsAppController from "../controllers/WhatsAppController";

const whatsappRoutes = express.Router();

whatsappRoutes.get("/whatsapp/", isAuth, WhatsAppController.index);

whatsappRoutes.get("/whatsapp2/", isAuth, WhatsAppController.index2);

whatsappRoutes.post("/whatsapp/", isAuth, WhatsAppController.store);

whatsappRoutes.get(
  "/whatsapp/listReport/",
  isAuth,
  WhatsAppController.listReport
);

whatsappRoutes.get("/whatsapp/:whatsappId", isAuth, WhatsAppController.show);

whatsappRoutes.put("/whatsapp/transfer/", isAuth, WhatsAppController.transfer);

whatsappRoutes.put(
  "/whatsapp/maturing/:whatsappId",
  isAuth,
  WhatsAppController.maturing
);

whatsappRoutes.put(
  "/whatsapp/sleeping/:whatsappId",
  isAuth,
  WhatsAppController.sleeping
);

whatsappRoutes.put(
  "/whatsapp/automaticControl/:whatsappId",
  isAuth,
  WhatsAppController.automaticControl
);

whatsappRoutes.put(
  "/whatsapp/config/multiple",
  isAuth,
  WhatsAppController.multipleConfig
);

whatsappRoutes.put(
  "/whatsapp/config/:whatsappId",
  isAuth,
  WhatsAppController.config
);

whatsappRoutes.put("/whatsapp/:whatsappId", isAuth, WhatsAppController.update);

whatsappRoutes.delete(
  "/whatsapp/:whatsappId",
  isAuth,
  WhatsAppController.remove
);

export default whatsappRoutes;
