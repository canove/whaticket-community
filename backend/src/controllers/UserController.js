const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

exports.store = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res
			.status(400)
			.json({ error: "Validation failed", data: errors.array() });
	}

	const { name, password, email } = req.body;

	const hashedPw = await bcrypt.hash(password, 12);
	const user = User.build({
		email: email,
		password: hashedPw,
		name: name,
	});
	const result = await user.save();
	res.status(201).json({ message: "User created!", userId: result.id });
};
