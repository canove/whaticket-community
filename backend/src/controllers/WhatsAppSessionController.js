const Whatsapp = require("../models/Whatsapp");
const { getIO } = require("../libs/socket");
const { getWbot } = require("../libs/wbot");

exports.index = async (req, res) => {
	const dbSession = await Whatsapp.findAll();

	return res.status(200).json(dbSession);
};

exports.show = async (req, res) => {
	const { sessionId } = req.params;
	const dbSession = await Whatsapp.findByPk(sessionId);

	if (!dbSession) {
		return res.status(200).json({ message: "Session not found" });
	}

	return res.status(200).json(dbSession);
};

exports.update = async (req, res) => {
	const { sessionId } = req.params;

	const dbSession = await Whatsapp.findByPk(sessionId);

	if (!dbSession) {
		return res.status(404).json({ message: "Session not found" });
	}

	const wbot = getWbot(dbSession.id);
	const io = getIO();

	await dbSession.update(req.body);
	wbot.logout();

	io.emit("session", {
		action: "update",
		session: dbSession,
	});

	return res.status(200).json({ message: "session disconnected" });
};
