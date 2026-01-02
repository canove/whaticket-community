import { Router } from "express";
import isAuth from "../middleware/isAuth.js";

import * as SettingController from "../controllers/SettingController.js";

const settingRoutes = Router();

settingRoutes.get("/settings", isAuth, SettingController.index);

// routes.get("/settings/:settingKey", isAuth, SettingsController.show);

// change setting key to key in future
settingRoutes.put("/settings/:settingKey", isAuth, SettingController.update);

export default settingRoutes;
