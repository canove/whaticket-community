const Contact = require("../models/Contact");
const { getIO } = require("../libs/socket");
const { getWbot, init } = require("../libs/wbot");

exports.store = async (req, res, next) => {
	const io = getIO();
	const wbot = getWbot();

	const phoneContacts = await wbot.getContacts();

	await Promise.all(
		phoneContacts.map(async ({ number, name }) => {
			await Contact.create({ number, name });
		})
	);

	return res.status(200).json({ message: "contacts imported" });
};
