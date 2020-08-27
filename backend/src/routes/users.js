const express = require("express");
const { body } = require("express-validator");
const User = require("../models/User");

const isAuth = require("../middleware/is-auth");
const UserController = require("../controllers/UserController");

const routes = express.Router();

routes.get("/users", isAuth, UserController.index);

routes.post(
	"/users",
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

routes.put("/users/:userId", isAuth, UserController.update);

routes.delete("/users/:userId", isAuth, UserController.delete);

module.exports = routes;
