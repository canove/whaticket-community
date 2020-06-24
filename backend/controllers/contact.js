const Contact = require("../models/Contact");
const Message = require("../models/Message");
const Sequelize = require("sequelize");
const { getIO } = require("../socket");
const { getWbot } = require("./wbot");

exports.getContacts = async (req, res) => {
	const { searchParam } = req.query;

	const lowerSerachParam = searchParam.toLowerCase();

	const whereCondition = {
		name: Sequelize.where(
			Sequelize.fn("LOWER", Sequelize.col("name")),
			"LIKE",
			"%" + lowerSerachParam + "%"
		),
	};

	//todo >> add contact number to search where condition

	try {
		const contacts = await Contact.findAll({
			where: whereCondition,
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
			order: [["updatedAt", "DESC"]],
		});

		return res.json(contacts);
	} catch (err) {
		console.log(err);
	}
};

exports.createContact = async (req, res, next) => {
	const wbot = getWbot();
	const io = getIO();
	const { number, name } = req.body;

	try {
		const res = await wbot.isRegisteredUser(`55${number}@c.us`);

		if (!res) {
			const error = new Error("O número informado não é um Whatsapp Válido");
			error.statusCode = 422;
			throw error;
		}
		const profilePicUrl = await wbot.getProfilePicUrl(`55${number}@c.us`);

		const contact = await Contact.create({
			name,
			number: `55${number}`,
			profilePicUrl,
		});

		res.status(200).json(contact);
	} catch (err) {
		next(err);
	}
};
