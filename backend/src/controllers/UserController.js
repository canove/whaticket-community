const { validationResult } = require("express-validator");

const User = require("../models/User");

exports.index = async (req, res) => {
	// const { searchParam = "", pageNumber = 1 } = req.query;

	const users = await User.findAll({ attributes: ["name", "id", "email"] });

	return res.status(200).json(users);
};

exports.store = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res
			.status(400)
			.json({ error: "Validation failed", data: errors.array() });
	}

	const { name, id, email } = await User.create(req.body);

	res.status(201).json({ message: "User created!", userId: id });
};

exports.update = async (req, res) => {
	const { userId } = req.params;

	const user = await User.findByPk(userId, {
		attributes: ["name", "id", "email"],
	});

	if (!user) {
		res.status(400).json({ error: "No user found with this id." });
	}

	await user.update(req.body);

	//todo, send socket IO to users channel.

	res.status(200).json(user);
};

exports.delete = async (req, res) => {
	const { userId } = req.params;

	const user = await User.findByPk(userId);

	if (!user) {
		res.status(400).json({ error: "No user found with this id." });
	}

	await user.destroy();

	res.status(200).json({ message: "User deleted" });
};
