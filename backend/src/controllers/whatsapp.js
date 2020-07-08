const Whatsapp = require("../models/Whatsapp");
const { getIO } = require("../libs/socket");
const { getWbot, init } = require("../libs/wbot");

exports.getSession = async (req, res, next) => {
	const dbSession = await Whatsapp.findOne({ where: { id: 1 } });

	if (!dbSession) {
		return res.status(200).json({ message: "Session not found" });
	}

	return res.status(200).json(dbSession);
};

exports.getContacts = async (req, res, next) => {
	const io = getIO();
	const wbot = getWbot();

	const phoneContacts = await wbot.getContacts();

	return res.status(200).json(phoneContacts);
};
