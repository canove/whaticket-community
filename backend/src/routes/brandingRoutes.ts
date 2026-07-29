import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as BrandingController from "../controllers/BrandingController";

const brandingRoutes = Router();

// Public — the theme and header need branding before/without a session.
brandingRoutes.get("/branding", BrandingController.show);

// Authenticated — only signed-in users can change the brand.
brandingRoutes.put("/branding", isAuth, BrandingController.update);

export default brandingRoutes;
