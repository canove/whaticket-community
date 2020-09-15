import { Router, Request, Response } from "express";
import SessionController from "../controllers/SessionController";
import isAuth from "../middleware/isAuth";
import * as UserController from "../controllers/UserController";

const authRoutes = Router();

authRoutes.post("/signup", UserController.store);

authRoutes.post("/login", SessionController);

authRoutes.get("/check", isAuth, (req: Request, res: Response) => {
  res.status(200).json({ authenticated: true });
});

export default authRoutes;
