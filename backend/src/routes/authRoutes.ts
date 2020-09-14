import { Router } from "express";
import SessionController from "../controllers/SessionController";
import * as UserController from "../controllers/UserController";

const authRoutes = Router();

authRoutes.post("/signup", UserController.store);

authRoutes.post("/login", SessionController);

export default authRoutes;
