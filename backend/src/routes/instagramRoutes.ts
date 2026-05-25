import { Router } from "express";
import isAuth from "../middleware/isAuth.js";
import InstagramOAuthController from "../controllers/InstagramOAuthController.js";

const instagramRoutes = Router();

// OAuth — requires user authentication
instagramRoutes.get(
  "/instagram/oauth/url",
  isAuth,
  InstagramOAuthController.getOAuthUrl
);
instagramRoutes.get(
  "/instagram/oauth/callback",
  InstagramOAuthController.callback
);
instagramRoutes.post(
  "/instagram/oauth/disconnect",
  isAuth,
  InstagramOAuthController.disconnect
);
instagramRoutes.get(
  "/instagram/oauth/diagnose",
  isAuth,
  InstagramOAuthController.diagnose
);
instagramRoutes.post(
  "/instagram/oauth/resubscribe",
  isAuth,
  InstagramOAuthController.resubscribe
);

export default instagramRoutes;
