const Whatsapp = require("../models/Whatsapp");
const { getIO } = require("../libs/socket");
const { getWbot, initWbot, removeWbot } = require("../libs/wbot");
const wbotMessageListener = require("../services/wbotMessageListener");
const wbotMonitor = require("../services/wbotMonitor");

exports.index = async (req, res) => {
	const dbSession = await Whatsapp.findAll();

	return res.status(200).json(dbSession);
};

exports.store = async (req, res) => {
	const io = getIO();
	const dbSession = await Whatsapp.create(req.body);

	if (!dbSession) {
		return res.status(400).json({ error: "Cannot create whatsapp session." });
	}

	initWbot(dbSession)
		.then(() => {
			wbotMessageListener(dbSession);
			wbotMonitor(dbSession);
		})
		.catch(err => console.log(err));

	io.emit("session", {
		action: "update",
		session: dbSession,
	});

	return res.status(200).json({ message: "Session created sucessfully." });
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
	const io = getIO();
	const { sessionId } = req.params;

	const dbSession = await Whatsapp.findByPk(sessionId);

	if (!dbSession) {
		return res.status(404).json({ message: "Session not found" });
	}

	const wbot = getWbot(dbSession.id);
	wbot.logout();

	await dbSession.update(req.body);

	io.emit("session", {
		action: "update",
		session: dbSession,
	});

	return res.status(200).json({ message: "Session updated" });
};

exports.delete = async (req, res) => {
	const io = getIO();
	const { sessionId } = req.params;

	const dbSession = await Whatsapp.findByPk(sessionId);

	if (!dbSession) {
		return res.status(404).json({ message: "Session not found" });
	}

	const wbot = getWbot(dbSession.id);
	await dbSession.destroy();

	removeWbot(dbSession.id);

	io.emit("session", {
		action: "delete",
		sessionId: dbSession.id,
	});

	return res.status(200).json({ message: "Session deleted." });
};
