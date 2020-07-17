const Contact = require("../models/Contact");
// const Message = require("../models/Message");
// const Sequelize = require("sequelize");
// const { getIO } = require("../libs/socket");
// const { getWbot } = require("../libs/wbot");

exports.index = async (req, res) => {
	// const { searchParam = "" } = req.query;

	// const lowerSerachParam = searchParam.toLowerCase();

	// const whereCondition = {
	// 	name: Sequelize.where(
	// 		Sequelize.fn("LOWER", Sequelize.col("name")),
	// 		"LIKE",
	// 		"%" + lowerSerachParam + "%"
	// 	),
	// };

	//todo >> add contact number to search where condition

	const contacts = await Contact.findAll();

	return res.json(contacts);
};

exports.store = async (req, res) => {
	// const wbot = getWbot();
	// const io = getIO();
	// const { number, name } = req.body;

	// const result = await wbot.isRegisteredUser(`55${number}@c.us`);

	// if (!result) {
	// 	return res
	// 		.status(400)
	// 		.json({ error: "The suplied number is not a valid Whatsapp number" });
	// }
	// const profilePicUrl = await wbot.getProfilePicUrl(`55${number}@c.us`);

	const { number, name } = await Contact.create(req.body);

	res.status(200).json({ number, name });
};
