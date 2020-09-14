const express = require("express");
const SessionController = require("../../controllers/SessionController");
const UserController = require("../../controllers/UserController");
const isAuth = require("../../middleware/is-auth");

const routes = express.Router();

routes.post("/signup", UserController.store);

routes.post("/login", SessionController.store);

routes.get("/check", isAuth, (req, res) => {
	res.status(200).json({ authenticated: true });
});

module.exports = routes;
