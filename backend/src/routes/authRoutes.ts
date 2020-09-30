import { Router } from "express";
import * as SessionController from "../controllers/SessionController";
import * as UserController from "../controllers/UserController";

const authRoutes = Router();

authRoutes.post("/signup", UserController.store);

authRoutes.post("/login", SessionController.store);

authRoutes.post("/refresh_token", SessionController.update);

export default authRoutes;
