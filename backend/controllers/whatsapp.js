const Whatsapp = require("../models/Whatsapp");
const { getIO } = require("../socket");
const { getWbot, init } = require("./wbot");

exports.getSession = async (req, res, next) => {
	try {
		const dbSession = await Whatsapp.findOne({ where: { id: 1 } });

		if (!dbSession) {
			return res.status(200).json({ message: "Session not found" });
		}

		return res.status(200).json(dbSession);
	} catch (err) {
		next(err);
	}
};

exports.getContacts = async (req, res, next) => {
	const io = getIO();
	const wbot = getWbot();

	try {
		const phoneContacts = await wbot.getContacts();

		return res.status(200).json(phoneContacts);
	} catch (err) {
		next(err);
	}
};
