const Message = require("../models/Message");
const Contact = require("../models/Contact");
const User = require("../models/User");

const Ticket = require("../models/Ticket");
const { getIO } = require("../libs/socket");
const { getWbot } = require("../libs/wbot");
const Sequelize = require("sequelize");

const { MessageMedia } = require("whatsapp-web.js");

const setMessagesAsRead = async ticketId => {
	const io = getIO();
	await Message.update(
		{ read: true },
		{
			where: {
				ticketId: ticketId,
				read: false,
			},
		}
	);

	io.to("notification").emit("ticket", {
		action: "updateUnread",
		ticketId: ticketId,
	});
};

exports.index = async (req, res, next) => {
	// const wbot = getWbot();
	// const io = getIO();

	const { ticketId } = req.params;
	const { searchParam = "", pageNumber = 1 } = req.query;

	const whereCondition = {
		body: Sequelize.where(
			Sequelize.fn("LOWER", Sequelize.col("body")),
			"LIKE",
			"%" + searchParam.toLowerCase() + "%"
		),
	};

	let limit = 20;
	let offset = limit * (pageNumber - 1);

	const ticket = await Ticket.findByPk(ticketId, {
		include: [
			{
				model: Contact,
				as: "contact",
				include: "extraInfo",
				attributes: ["id", "name", "number", "profilePicUrl"],
			},
			{
				model: User,
				as: "user",
			},
		],
	});

	if (!ticket) {
		return res.status(400).json({ error: "No ticket found with this ID" });
	}

	await setMessagesAsRead(ticketId);

	const ticketMessages = await ticket.getMessages({
		where: whereCondition,
		limit,
		offset,
		order: [["createdAt", "DESC"]],
	});

	const serializedMessages = ticketMessages.map(message => {
		return {
			...message.dataValues,
			mediaUrl: `${
				message.mediaUrl
					? `http://${process.env.HOST}:${process.env.PORT}/public/${message.mediaUrl}`
					: ""
			}`,
		};
	});

	return res.json({
		messages: serializedMessages.reverse(),
		ticket: ticket,
	});
};

exports.store = async (req, res, next) => {
	const wbot = getWbot();
	const io = getIO();

	const { ticketId } = req.params;
	const message = req.body;
	const media = req.file;
	let sentMessage;

	const ticket = await Ticket.findByPk(ticketId, {
		include: [
			{
				model: Contact,
				as: "contact",
				attributes: ["number", "name", "profilePicUrl"],
			},
		],
	});

	if (media) {
		console.log(media);
		const newMedia = MessageMedia.fromFilePath(req.file.path);

		message.mediaUrl = req.file.filename;
		if (newMedia.mimetype) {
			message.mediaType = newMedia.mimetype.split("/")[0];
		} else {
			message.mediaType = "other";
		}

		sentMessage = await wbot.sendMessage(
			`${ticket.contact.number}@c.us`,
			newMedia
		);

		await ticket.update({ lastMessage: message.mediaUrl });
	} else {
		sentMessage = await wbot.sendMessage(
			`${ticket.contact.number}@c.us`,
			message.body
		);
		await ticket.update({ lastMessage: message.body });
	}

	message.id = sentMessage.id.id;

	const newMessage = await ticket.createMessage(message);

	const serialziedMessage = {
		...newMessage.dataValues,
		mediaUrl: `${
			message.mediaUrl
				? `http://${process.env.HOST}:${process.env.PORT}/public/${message.mediaUrl}`
				: ""
		}`,
	};

	io.to(ticketId).to("notification").emit("appMessage", {
		action: "create",
		message: serialziedMessage,
		ticket: ticket,
		contact: ticket.contact,
	});

	await setMessagesAsRead(ticketId);

	return res.json({ message: "Mensagem enviada", newMessage, ticket });
};
