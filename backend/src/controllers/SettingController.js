const Setting = require("../models/Setting");
const { getIO } = require("../libs/socket");

exports.index = async (req, res) => {
	if (req.user.profile !== "admin") {
		return res
			.status(403)
			.json({ error: "Only administrators can access this route." });
	}

	const settings = await Setting.findAll();

	return res.status(200).json(settings);
};

exports.update = async (req, res) => {
	if (req.user.profile !== "admin") {
		return res
			.status(403)
			.json({ error: "Only administrators can access this route." });
	}

	const io = getIO();
	const { settingKey } = req.params;
	const setting = await Setting.findByPk(settingKey);

	if (!setting) {
		return res.status(404).json({ error: "No setting found with this ID" });
	}

	await setting.update(req.body);

	io.emit("settings", {
		action: "update",
		setting,
	});

	return res.status(200).json(setting);
};
