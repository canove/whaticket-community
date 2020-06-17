const Contact = require("../models/Contact");
const Message = require("../models/Message");
const Sequelize = require("sequelize");

exports.getContacts = async (req, res) => {
	try {
		const contacts = await Contact.findAll({
			include: {
				model: Message,
				attributes: [],
			},
			attributes: {
				include: [
					[
						Sequelize.literal(`(
			        SELECT COUNT(*)
			        FROM messages AS message
			        WHERE
			            message.contactId = contact.id
			            AND
			            message.read = 0

			    )`),
						"unreadMessages",
					],
				],
			},
			order: [[Message, "createdAt", "DESC"]],
		});

		return res.json(contacts);
	} catch (err) {
		console.log(err);
	}
};
