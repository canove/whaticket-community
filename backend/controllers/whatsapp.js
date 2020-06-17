const Whatsapp = require("../models/whatsapp");

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
