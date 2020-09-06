const Yup = require("yup");
const Whatsapp = require("../models/Whatsapp");
const { getIO } = require("../libs/socket");
const { getWbot, initWbot, removeWbot } = require("../libs/wbot");
const wbotMessageListener = require("../services/wbotMessageListener");
const wbotMonitor = require("../services/wbotMonitor");

exports.index = async (req, res) => {
	const whatsapps = await Whatsapp.findAll();

	return res.status(200).json(whatsapps);
};

exports.store = async (req, res) => {
	const schema = Yup.object().shape({
		name: Yup.string().required().min(2),
		default: Yup.boolean()
			.required()
			.test(
				"Check-default",
				"Only one default whatsapp is permited",
				async value => {
					// console.log("cai no if", value);
					if (value === true) {
						const whatsappFound = await Whatsapp.findOne({
							where: { default: true },
						});
						return !Boolean(whatsappFound);
					} else return true;
				}
			),
	});

	try {
		await schema.validate(req.body);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}

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
	const { whatsappId } = req.params;

	const schema = Yup.object().shape({
		name: Yup.string().required().min(2),
		default: Yup.boolean()
			.required()
			.test(
				"Check-default",
				"Only one default whatsapp is permited",
				async value => {
					if (value === true) {
						const whatsappFound = await Whatsapp.findOne({
							where: { default: true },
						});
						if (whatsappFound) {
							return !(whatsappFound.id !== +whatsappId);
						}
					} else return true;
				}
			),
	});

	try {
		await schema.validate(req.body);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}

	const io = getIO();

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
