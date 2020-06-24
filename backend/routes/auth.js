const express = require("express");
const { body } = require("express-validator");
const User = require("../models/User");
const authController = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

const routes = express.Router();

routes.put(
	"/signup",
	[
		body("email")
			.isEmail()
			.withMessage("Email inválido")
			.custom((value, { req }) => {
				return User.findOne({ where: { email: value } }).then(user => {
					if (user) {
						return Promise.reject("Um cadastro com este email já existe!");
					}
				});
			})
			.normalizeEmail(),
		body("password").trim().isLength({ min: 5 }),
		body("name").trim().not().isEmpty(),
	],
	authController.signup
);

routes.post("/login", authController.login);

routes.get("/check", isAuth, (req, res) => {
	res.status(200).json({ authenticated: true });
});

module.exports = routes;
