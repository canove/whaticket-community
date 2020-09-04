const Whatsapp = require("../models/Whatsapp");
const { getIO } = require("../libs/socket");
const { getWbot } = require("../libs/wbot");

exports.show = async (req, res) => {
	const { sessionId } = req.params;
	const dbSession = await Whatsapp.findByPk(sessionId);

	if (!dbSession) {
		return res.status(200).json({ message: "Session not found" });
	}

	return res.status(200).json(dbSession);
};

exports.delete = async (req, res) => {
	const wbot = getWbot();
	const io = getIO();

	const { sessionId } = req.params;
	const dbSession = await Whatsapp.findByPk(sessionId);

	if (!dbSession) {
		return res.status(404).json({ message: "Session not found" });
	}

	await dbSession.update({ session: "", status: "pending" });
	wbot.logout();

	io.emit("session", {
		action: "logout",
		session: dbSession,
	});

	return res.status(200).json({ message: "session disconnected" });
};

// exports.getContacts = async (req, res, next) => {
// 	const io = getIO();
// 	const wbot = getWbot();

// 	const phoneContacts = await wbot.getContacts();

// 	return res.status(200).json(phoneContacts);
// };
