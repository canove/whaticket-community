const Whatsapp = require("../models/Whatsapp");
const { getIO } = require("../libs/socket");
const { getWbot, initWbot, removeWbot } = require("../libs/wbot");
const wbotMessageListener = require("../services/wbotMessageListener");
const wbotMonitor = require("../services/wbotMonitor");

exports.index = async (req, res) => {
	const whatsapp = await Whatsapp.findAll();

	return res.status(200).json(whatsapp);
};

exports.store = async (req, res) => {
	const io = getIO();
	const whatsapp = await Whatsapp.create(req.body);

	if (!whatsapp) {
		return res.status(400).json({ error: "Cannot create whatsapp session." });
	}

	initWbot(whatsapp)
		.then(() => {
			wbotMessageListener(whatsapp);
			wbotMonitor(whatsapp);
		})
		.catch(err => console.log(err));

	io.emit("whatsapp", {
		action: "update",
		whatsapp: whatsapp,
	});

	return res.status(200).json(whatsapp);
};

exports.show = async (req, res) => {
	const { whatsappId } = req.params;
	const whatsapp = await Whatsapp.findByPk(whatsappId);

	if (!whatsapp) {
		return res.status(200).json({ message: "Session not found" });
	}

	return res.status(200).json(whatsapp);
};

exports.update = async (req, res) => {
	const io = getIO();
	const { whatsappId } = req.params;

	const whatsapp = await Whatsapp.findByPk(whatsappId);

	if (!whatsapp) {
		return res.status(404).json({ message: "Whatsapp not found" });
	}

	await whatsapp.update(req.body);

	io.emit("whatsapp", {
		action: "update",
		whatsapp: whatsapp,
	});

	return res.status(200).json({ message: "Whatsapp updated" });
};

exports.delete = async (req, res) => {
	const io = getIO();
	const { whatsappId } = req.params;

	const whatsapp = await Whatsapp.findByPk(whatsappId);

	if (!whatsapp) {
		return res.status(404).json({ message: "Whatsapp not found" });
	}

	await whatsapp.destroy();
	removeWbot(whatsapp.id);

	io.emit("whatsapp", {
		action: "delete",
		whatsappId: whatsapp.id,
	});

	return res.status(200).json({ message: "Whatsapp deleted." });
};
