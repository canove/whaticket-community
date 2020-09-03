const Sequelize = require("sequelize");
const Yup = require("yup");
const { Op } = require("sequelize");

const User = require("../models/User");

const { getIO } = require("../libs/socket");

exports.index = async (req, res) => {
	const { searchParam = "", pageNumber = 1, rowsPerPage = 10 } = req.query;

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

	let limit = +rowsPerPage;
	let offset = limit * (pageNumber - 1);

	const { count, rows: users } = await User.findAndCountAll({
		attributes: ["name", "id", "email", "profile"],
		where: whereCondition,
		limit,
		offset,
		order: [["createdAt", "DESC"]],
	});

	return res.status(200).json({ users, count });
};

exports.store = async (req, res, next) => {
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

	console.log("cai aqui");

	await schema.validate(req.body);

	const io = getIO();
	const { userId } = req.params;

	const user = await User.findByPk(userId, {
		attributes: ["name", "id", "email", "profile"],
	});

	if (!user) {
		res.status(400).json({ error: "No user found with this id." });
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

	await user.destroy();

	io.emit("user", {
		action: "delete",
		userId: userId,
	});

	return res.status(200).json({ message: "User deleted" });
};
