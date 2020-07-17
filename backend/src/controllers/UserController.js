const { validationResult } = require("express-validator");

const User = require("../models/User");

exports.store = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res
			.status(400)
			.json({ error: "Validation failed", data: errors.array() });
	}

	const { name, id, email } = await User.create(req.body);
	// const result = await user.save();
	res.status(201).json({ message: "User created!", userId: id });
};
