import express from "express";
import isAuth from "../middleware/isAuth";

import * as WhatsAppController from "../controllers/WhatsAppController";

const whatsappRoutes = express.Router();

whatsappRoutes.get("/whatsapp/", isAuth, WhatsAppController.index);

whatsappRoutes.post("/whatsapp/", isAuth, WhatsAppController.store);

whatsappRoutes.get("/whatsapp/list/", isAuth, WhatsAppController.list);

whatsappRoutes.get("/whatsapp/listAll/", isAuth, WhatsAppController.listAll);

whatsappRoutes.get(
  "/whatsapp/listReport/",
  isAuth,
  WhatsAppController.listReport
);

whatsappRoutes.get("/whatsapp/:whatsappId", isAuth, WhatsAppController.show);

whatsappRoutes.put("/whatsapp/transfer/", isAuth, WhatsAppController.transfer);

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
