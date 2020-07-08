const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

exports.store = async (req, res, next) => {
	const { email, password } = req.body;

	const user = await User.findOne({ where: { email: email } });
	if (!user) {
		return res.status(400).json({ error: "No user found with this email" });
	}

	const isEqual = await bcrypt.compare(password, user.password);
	if (!isEqual) {
		return res.status(401).json({ error: "Password does not match" });
	}

	const token = jwt.sign({ email: user.email, userId: user.id }, "mysecret", {
		expiresIn: "24h",
	});

	return res
		.status(200)
		.json({ token: token, username: user.name, userId: user.id });
};
