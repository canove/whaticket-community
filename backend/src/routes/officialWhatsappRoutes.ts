import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as OfficialWhatsappController from "../controllers/OfficialWhatsappController";

const officialWhatsappRoutes = Router();

officialWhatsappRoutes.get("/officialWhatsapps", isAuth, OfficialWhatsappController.index);

export default officialWhatsappRoutes;
