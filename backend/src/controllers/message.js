const fs = require("fs");
const Message = require("../models/Message");
const Contact = require("../models/Contact");
const { getIO } = require("../libs/socket");
const { getWbot } = require("../libs/wbot");
const Sequelize = require("sequelize");

const { MessageMedia } = require("whatsapp-web.js");

const setMessagesAsRead = async contactId => {
	const io = getIO();
	await Message.update(
		{ read: true },
		{
			where: {
				contactId: contactId,
				read: false,
			},
		}
	);

	io.to("notification").emit("contact", {
		action: "updateUnread",
		contactId: contactId,
	});
};

exports.getContactMessages = async (req, res, next) => {
	const wbot = getWbot();
	const io = getIO();

	const { contactId } = req.params;
	const { searchParam = "", pageNumber = 1 } = req.query;

	const lowerSerachParam = searchParam.toLowerCase();

	const whereCondition = {
		messageBody: Sequelize.where(
			Sequelize.fn("LOWER", Sequelize.col("messageBody")),
			"LIKE",
			"%" + lowerSerachParam + "%"
		),
	};

	let limit = 20;
	let offset = limit * (pageNumber - 1);

	const contact = await Contact.findByPk(contactId);
	if (!contact) {
		return res.status(400).json({ error: "No contact found with this ID" });
	}

	await setMessagesAsRead(contactId);

	const contactMessages = await contact.getMessages({
		where: whereCondition,
		limit,
		offset,
		order: [["createdAt", "DESC"]],
	});

	const serializedMessages = contactMessages.map(message => {
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
		contact: contact,
	});
};

exports.postCreateContactMessage = async (req, res, next) => {
	const wbot = getWbot();
	const io = getIO();

	const { contactId } = req.params;
	const message = req.body;
	const media = req.file;
	let sentMessage;

	const contact = await Contact.findByPk(contactId);
	if (media) {
		const newMedia = MessageMedia.fromFilePath(req.file.path);
		message.mediaUrl = req.file.filename.replace(/\s/g, "");
		if (newMedia.mimetype) {
			message.mediaType = newMedia.mimetype.split("/")[0];
		} else {
			message.mediaType = "other";
		}

		sentMessage = await wbot.sendMessage(`${contact.number}@c.us`, newMedia);
	} else {
		sentMessage = await wbot.sendMessage(
			`${contact.number}@c.us`,
			message.messageBody
		);
	}

	message.id = sentMessage.id.id;

	const newMessage = await contact.createMessage(message);

	const serialziedMessage = {
		...newMessage.dataValues,
		mediaUrl: `${
			message.mediaUrl
				? `http://${process.env.HOST}:${process.env.PORT}/public/${message.mediaUrl}`
				: ""
		}`,
	};

	io.to(contactId).emit("appMessage", {
		action: "create",
		message: serialziedMessage,
	});
	await setMessagesAsRead(contactId);

	return res.json({ message: "Mensagem enviada" });
};
