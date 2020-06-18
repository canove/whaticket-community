const Contact = require("../models/Contact");
const Message = require("../models/Message");
const Sequelize = require("sequelize");

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
