import express from "express";
import isAuth from "../middleware/isAuth";
import * as WhatsAppController from "../controllers/WhatsAppController";

const whatsappRoutes = express.Router();

whatsappRoutes.use(isAuth); // Apply isAuth middleware to all routes in this router

whatsappRoutes.get("/whatsapp/", WhatsAppController.fetchAllWhatsAppEntries);
whatsappRoutes.post("/whatsapp/", WhatsAppController.createWhatsAppEntry);
whatsappRoutes.get("/whatsapp/:whatsappId", WhatsAppController.getAndShowWhatsAppDetails);
whatsappRoutes.put("/whatsapp/:whatsappId", WhatsAppController.updateAndNotifyWhatsApp);
whatsappRoutes.delete("/whatsapp/:whatsappId", WhatsAppController.remove);

export default whatsappRoutes;
