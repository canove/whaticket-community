import express from "express";
import isAuth from "../middleware/isAuth";

import * as CompanySettingsController from "../controllers/CompanySettingsController";

const companySettingsRoutes = express.Router();

companySettingsRoutes.get(
  "/companySettings/",
  isAuth,
  CompanySettingsController.index
);

companySettingsRoutes.post(
  "/companySettings/",
  isAuth,
  CompanySettingsController.store
);

export default companySettingsRoutes;
