const Contact = require("../models/Contact");
const { getIO } = require("../libs/socket");
const { getWbot, initWbot } = require("../libs/wbot");

exports.store = async (req, res, next) => {
	const io = getIO();
	const wbot = getWbot();

	let phoneContacts;

	try {
		phoneContacts = await wbot.getContacts();
	} catch (err) {
		console.log(err);
		return res.status(500).json({
			error: "Could not check whatsapp contact. Check connection page.",
		});
	}

	await Promise.all(
		phoneContacts.map(async ({ number, name }) => {
			await Contact.create({ number, name });
		})
	);

	return res.status(200).json({ message: "contacts imported" });
};
