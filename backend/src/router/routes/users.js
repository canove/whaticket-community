const express = require("express");

const isAuth = require("../../middleware/is-auth");
const UserController = require("../../controllers/UserController");

const routes = express.Router();

routes.get("/users", isAuth, UserController.index);

routes.post("/users", isAuth, UserController.store);

routes.put("/users/:userId", isAuth, UserController.update);

routes.get("/users/:userId", isAuth, UserController.show);

routes.delete("/users/:userId", isAuth, UserController.delete);

module.exports = routes;
