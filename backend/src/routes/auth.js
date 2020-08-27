const express = require("express");
const SessionController = require("../controllers/SessionController");
const isAuth = require("../middleware/is-auth");

const routes = express.Router();

routes.post("/login", SessionController.store);

routes.get("/check", isAuth, (req, res) => {
	res.status(200).json({ authenticated: true });
});

module.exports = routes;
