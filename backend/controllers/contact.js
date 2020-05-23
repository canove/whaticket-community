const Contact = require("../models/Contact");
const Message = require("../models/Message");
// const io = require("../socket");

exports.getContacts = async (req, res) => {
	// const contacts = await Contact.findAll();
	const contacts = await Contact.findAll({
		include: {
			model: Message,
			where: {
				read: false,
			},
			required: false,
		},
	});

	return res.json(contacts);
};
