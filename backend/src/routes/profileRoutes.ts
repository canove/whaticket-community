import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as ProfileController from "../controllers/ProfileController";

const profileRoutes = Router();

profileRoutes.get("/profile", isAuth, ProfileController.index);

profileRoutes.post("/profile", isAuth, ProfileController.store);

profileRoutes.get("/profile/check", isAuth, ProfileController.check);

profileRoutes.get("/profile/:profileId", isAuth, ProfileController.show);

profileRoutes.put("/profile/:profileId", isAuth, ProfileController.update);

profileRoutes.delete(
  "/profile/:profileId",
  isAuth,
  ProfileController.remove
);

export default profileRoutes;
