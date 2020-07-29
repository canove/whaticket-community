const Sequelize = require("sequelize");

const Ticket = require("../models/Ticket");
const Contact = require("../models/Contact");

const { getIO } = require("../libs/socket");

exports.index = async (req, res) => {
	const { status = "" } = req.query;

	let whereCondition;
	if (!status || status === "open") {
		whereCondition = ["pending", "open"];
	} else {
		whereCondition = [status];
	}

	const tickets = await Ticket.findAll({
		where: {
			status: { [Sequelize.Op.or]: whereCondition },
		},
		include: [
			{
				model: Contact,
				as: "contact",
				attributes: ["name", "number", "profilePicUrl"],
			},
		],
		attributes: {
			include: [
				[
					Sequelize.literal(`(
			        SELECT COUNT(*)
			        FROM Messages AS message
			        WHERE
			            message.ticketId = Ticket.id
			            AND
			            message.read = 0

			    )`),
					"unreadMessages",
				],
			],
		},
		order: [["updatedAt", "DESC"]],
	});

	return res.json(tickets);
};

exports.store = async (req, res) => {
	const io = getIO();
	const ticket = await Ticket.create(req.body);

	const contact = await ticket.getContact();

	const serializaedTicket = { ...ticket.dataValues, contact: contact };

	io.to("notification").emit("ticket", {
		action: "create",
		ticket: serializaedTicket,
	});

	res.status(200).json(ticket);
};

exports.update = async (req, res) => {
	const io = getIO();
	const { ticketId } = req.params;

	const ticket = await Ticket.findByPk(ticketId, {
		include: [
			{
				model: Contact,
				as: "contact",
				attributes: ["name", "number", "profilePicUrl"],
			},
		],
		attributes: {
			include: [
				[
					Sequelize.literal(`(
			        SELECT COUNT(*)
			        FROM Messages AS message
			        WHERE
			            message.ticketId = Ticket.id
			            AND
			            message.read = 0

			    )`),
					"unreadMessages",
				],
			],
		},
	});

	if (!ticket) {
		return res.status(400).json({ error: "No ticket found with this ID" });
	}

	await ticket.update(req.body);

	io.to("notification").emit("ticket", {
		action: "updateStatus",
		ticket: ticket,
	});

	res.status(200).json(ticket);
};
