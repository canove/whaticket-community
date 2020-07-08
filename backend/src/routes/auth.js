const express = require("express");
const { body } = require("express-validator");
const User = require("../models/User");
const SessionController = require("../controllers/SessionController");
const UserController = require("../controllers/UserController");
const isAuth = require("../middleware/is-auth");

const routes = express.Router();

routes.post(
	"/signup",
	[
		body("email")
			.isEmail()
			.withMessage("Email inválido")
			.custom((value, { req }) => {
				return User.findOne({ where: { email: value } }).then(user => {
					if (user) {
						return Promise.reject("An user with this email already exists!");
					}
				});
			})
			.normalizeEmail(),
		body("password").trim().isLength({ min: 5 }),
		body("name").trim().not().isEmpty(),
	],
	UserController.store
);

routes.post("/login", SessionController.store);

routes.get("/check", isAuth, (req, res) => {
	res.status(200).json({ authenticated: true });
});

module.exports = routes;
