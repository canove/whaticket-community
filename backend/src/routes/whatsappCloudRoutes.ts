import { Router } from "express";
import isAuth from "../middleware/isAuth.js";
import WhatsAppCloudController from "../controllers/WhatsAppCloudController.js";

const whatsappCloudRoutes = Router();

whatsappCloudRoutes.post(
  "/whatsapp-cloud/connect",
  isAuth,
  WhatsAppCloudController.connect
);
whatsappCloudRoutes.post(
  "/whatsapp-cloud/disconnect",
  isAuth,
  WhatsAppCloudController.disconnect
);
whatsappCloudRoutes.get(
  "/whatsapp-cloud/diagnose",
  isAuth,
  WhatsAppCloudController.diagnose
);
whatsappCloudRoutes.post(
  "/whatsapp-cloud/register",
  isAuth,
  WhatsAppCloudController.register
);

export default whatsappCloudRoutes;
