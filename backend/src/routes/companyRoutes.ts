import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as CompanyController from "../controllers/CompanyController";
import * as FirebaseCompanyController from "../controllers/FirebaseCompanyController";

const companyRoutes = Router();

companyRoutes.get("/company", isAuth, CompanyController.index);

companyRoutes.post("/companies", isAuth, CompanyController.store);

companyRoutes.put("/companies/:companyId", isAuth, CompanyController.update);

companyRoutes.get("/companies/:companyId", isAuth, CompanyController.show);

companyRoutes.delete("/companies/:companyId", isAuth, CompanyController.remove);

companyRoutes.post(
  "/companies/uploadLogo/:companyId",
  isAuth,
  CompanyController.uploadLogoToS3
);

companyRoutes.get(
  "/firebase/company/:companyId",
  isAuth,
  FirebaseCompanyController.show
);

companyRoutes.post(
  "/firebase/company/:companyId",
  isAuth,
  FirebaseCompanyController.store
);

export default companyRoutes;
