import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as UserController from "../controllers/UserController";

const userRoutes = Router();

userRoutes.get("/users", (req, res) =>
  res.json({ meessage: "lets do some prettier shit here" })
);

userRoutes.post("/users", isAuth, UserController.store);

// userRoutes.put("/users/:userId", isAuth, UserController.update);

// userRoutes.get("/users/:userId", isAuth, UserController.show);

// userRoutes.delete("/users/:userId", isAuth, UserController.delete);

export default userRoutes;
