import express from "express";
import isAuth from "../middleware/isAuth";

import * as WhatsAppController from "../controllers/WhatsAppController";

const whatsappRoutes = express.Router();

whatsappRoutes.get("/whatsapp/", isAuth, WhatsAppController.index);

whatsappRoutes.post("/whatsapp/", isAuth, WhatsAppController.store);

// whatsappRoutes.get("/whatsapp/:whatsappId", isAuth, WhatsAppController.show);

// whatsappRoutes.put("/whatsapp/:whatsappId", isAuth, WhatsAppController.update);

// whatsappRoutes.remove(
//   "/whatsapp/:whatsappId",
//   isAuth,
//   WhatsAppController.delete
// );

export default whatsappRoutes;
