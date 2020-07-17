const Whatsapp = require("../models/Whatsapp");
// const { getIO } = require("../libs/socket");
// const { getWbot, init } = require("../libs/wbot");

exports.show = async (req, res, next) => {
	const { sessionId } = req.params;
	const dbSession = await Whatsapp.findByPk(sessionId);

	if (!dbSession) {
		return res.status(200).json({ message: "Session not found" });
	}

	return res.status(200).json(dbSession);
};

// exports.getContacts = async (req, res, next) => {
// 	const io = getIO();
// 	const wbot = getWbot();

// 	const phoneContacts = await wbot.getContacts();

// 	return res.status(200).json(phoneContacts);
// };
