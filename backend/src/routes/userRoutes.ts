import { Router } from "express";

// const isAuth = require("../../middleware/is-auth");
// const UserController = require("../../controllers/UserController");

const userRoutes = Router();

userRoutes.get("/users", (req, res) =>
  res.json({ meessage: "lets do some prettier shit here" })
);

// routes.post("/users", isAuth, UserController.store);

// routes.put("/users/:userId", isAuth, UserController.update);

// routes.get("/users/:userId", isAuth, UserController.show);

// routes.delete("/users/:userId", isAuth, UserController.delete);

export default userRoutes;
