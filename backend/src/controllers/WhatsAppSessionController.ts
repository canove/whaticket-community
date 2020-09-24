// const Whatsapp = require("../models/Whatsapp");
// const { getIO } = require("../libs/socket");
// const { getWbot, initWbot, removeWbot } = require("../libs/wbot");
// const wbotMessageListener = require("../services/wbotMessageListener");
// const wbotMonitor = require("../services/wbotMonitor");

// exports.show = async (req, res) => {
// 	const { whatsappId } = req.params;
// 	const dbSession = await Whatsapp.findByPk(whatsappId);

// 	if (!dbSession) {
// 		return res.status(200).json({ message: "Session not found" });
// 	}

// 	return res.status(200).json(dbSession);
// };

// exports.delete = async (req, res) => {
// 	const { whatsappId } = req.params;

// 	const dbSession = await Whatsapp.findByPk(whatsappId);

// 	if (!dbSession) {
// 		return res.status(404).json({ message: "Session not found" });
// 	}

// 	const wbot = getWbot(dbSession.id);

// 	wbot.logout();

// 	return res.status(200).json({ message: "Session disconnected." });
// };
