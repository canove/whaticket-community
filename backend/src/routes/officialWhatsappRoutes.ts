import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as OfficialWhatsappController from "../controllers/OfficialWhatsappController";

const officialWhatsappRoutes = Router();

officialWhatsappRoutes.get("/officialWhatsapps", isAuth, OfficialWhatsappController.index);

officialWhatsappRoutes.post("/officialWhatsapps", isAuth, OfficialWhatsappController.store);

officialWhatsappRoutes.get("/officialWhatsapps/name/:officialWhatsappName", isAuth, OfficialWhatsappController.showByName);

officialWhatsappRoutes.get("/officialWhatsapps/:officialWhatsappId", isAuth, OfficialWhatsappController.show);

officialWhatsappRoutes.put("/officialWhatsapps/:officialWhatsappId", isAuth, OfficialWhatsappController.update);

export default officialWhatsappRoutes;
