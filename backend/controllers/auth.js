const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

exports.signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation failed");
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}
	const { name, password, email } = req.body;

	try {
		const hashedPw = await bcrypt.hash(password, 12);
		const user = User.build({
			email: email,
			password: hashedPw,
			name: name,
		});
		const result = await user.save();
		res.status(201).json({ message: "User created!", userId: result.id });
	} catch (err) {
		next(err);
	}
};

exports.login = async (req, res, next) => {
	const { email, password } = req.body;
	let loadedUser;

	try {
		const user = await User.findOne({ where: { email: email } });
		if (!user) {
			const error = new Error("Usuário não encontrado");
			error.statusCode = 401;
			throw error;
		}
		loadedUser = user;
		const isEqual = await bcrypt.compare(password, user.password);
		if (!isEqual) {
			const error = new Error("Senha incorreta");
			error.statusCode = 401;
			throw error;
		}
		const token = jwt.sign(
			{ email: loadedUser.email, userId: loadedUser.id },
			"mysecret",
			{ expiresIn: "24h" }
		);
		return res
			.status(200)
			.json({ token: token, username: loadedUser.name, userId: loadedUser.id });
	} catch (err) {
		next(err);
	}
};
