const Sequelize = require("sequelize");
const Yup = require("yup");
const { Op } = require("sequelize");

const User = require("../models/User");
const Setting = require("../models/Setting");

const { getIO } = require("../libs/socket");

exports.index = async (req, res) => {
	const { searchParam = "", pageNumber = 1 } = req.query;

	const whereCondition = {
		[Op.or]: [
			{
				name: Sequelize.where(
					Sequelize.fn("LOWER", Sequelize.col("name")),
					"LIKE",
					"%" + searchParam.toLowerCase() + "%"
				),
			},
			{ email: { [Op.like]: `%${searchParam.toLowerCase()}%` } },
		],
	};

	let limit = 20;
	let offset = limit * (pageNumber - 1);

	const { count, rows: users } = await User.findAndCountAll({
		attributes: ["name", "id", "email", "profile"],
		where: whereCondition,
		limit,
		offset,
		order: [["createdAt", "DESC"]],
	});

	const hasMore = count > offset + users.length;

	return res.status(200).json({ users, count, hasMore });
};

exports.store = async (req, res, next) => {
	console.log(req.url);
	const schema = Yup.object().shape({
		name: Yup.string().required().min(2),
		email: Yup.string()
			.email()
			.required()
			.test(
				"Check-email",
				"An user with this email already exists",
				async value => {
					const userFound = await User.findOne({ where: { email: value } });
					return !Boolean(userFound);
				}
			),
		password: Yup.string().required().min(5),
	});

	if (req.url === "/signup") {
		const { value: userCreation } = await Setting.findByPk("userCreation");

		if (userCreation === "disabled") {
			return res
				.status(403)
				.json({ error: "User creation is disabled by administrator." });
		}
	} else if (req.user.profile !== "admin") {
		return res
			.status(403)
			.json({ error: "Only administrators can create users." });
	}

	await schema.validate(req.body);

	const io = getIO();

	const { name, id, email, profile } = await User.create(req.body);

	io.emit("user", {
		action: "create",
		user: { name, id, email, profile },
	});

	return res.status(201).json({ message: "User created!", userId: id });
};

exports.show = async (req, res) => {
	const { userId } = req.params;

	const { id, name, email, profile } = await User.findByPk(userId);

	return res.status(200).json({
		id,
		name,
		email,
		profile,
	});
};

exports.update = async (req, res) => {
	const schema = Yup.object().shape({
		name: Yup.string().min(2),
		email: Yup.string().email(),
		password: Yup.string(),
	});

	if (req.user.profile !== "admin") {
		return res
			.status(403)
			.json({ error: "Only administrators can edit users." });
	}

	await schema.validate(req.body);

	const io = getIO();
	const { userId } = req.params;

	const user = await User.findByPk(userId, {
		attributes: ["name", "id", "email", "profile"],
	});

	if (!user) {
		res.status(400).json({ error: "No user found with this id." });
	}

	if (user.profile === "admin" && req.body.profile === "user") {
		const adminUsers = await User.count({ where: { profile: "admin" } });
		if (adminUsers <= 1) {
			return res
				.status(403)
				.json({ error: "There must be at leat one admin user." });
		}
		console.log("found", adminUsers);
	}

	await user.update(req.body);

	io.emit("user", {
		action: "update",
		user: user,
	});

	return res.status(200).json(user);
};

exports.delete = async (req, res) => {
	const io = getIO();
	const { userId } = req.params;

	const user = await User.findByPk(userId);

	if (!user) {
		res.status(400).json({ error: "No user found with this id." });
	}

	if (req.user.profile !== "admin") {
		return res
			.status(403)
			.json({ error: "Only administrators can edit users." });
	}

	await user.destroy();

	io.emit("user", {
		action: "delete",
		userId: userId,
	});

	return res.status(200).json({ message: "User deleted" });
};
