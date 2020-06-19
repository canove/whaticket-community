const fs = require("fs");
const Message = require("../models/Message");
const Contact = require("../models/Contact");
const { getIO } = require("../socket");
const { getWbot } = require("./wbot");
const Sequelize = require("sequelize");

const { MessageMedia } = require("whatsapp-web.js");

const setMessagesAsRead = async contactId => {
	const io = getIO();
	try {
		const result = await Message.update(
			{ read: true },
			{
				where: {
					contactId: contactId,
					read: false,
				},
			}
		);

		if (!result) {
			const error = new Error(
				"Erro ao definir as mensagens como lidas no banco de dados"
			);
			error.satusCode = 501;
			throw error;
		}

		io.to("notification").emit("contact", {
			action: "updateUnread",
			contactId: contactId,
		});
	} catch (err) {
		console.log(err);
	}
};

exports.getContactMessages = async (req, res, next) => {
	const wbot = getWbot();
	const io = getIO();

	const { contactId } = req.params;
	const { searchParam, pageNumber = 1 } = req.query;

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

	try {
		const contact = await Contact.findByPk(contactId);
		if (!contact) {
			const error = new Error("Erro ao localizar o contato no banco de dados");
			error.satusCode = 501;
			throw error;
		}

		await setMessagesAsRead(contactId);

		const messagesFound = await contact.countMessages({
			where: whereCondition,
		});
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
			messagesFound,
		});
	} catch (err) {
		next(err);
	}
};

exports.postCreateContactMessage = async (req, res, next) => {
	const wbot = getWbot();
	const io = getIO();

	const { contactId } = req.params;
	const message = req.body;
	const media = req.file;
	let sentMessage;

	try {
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
		if (!newMessage) {
			const error = new Error("Erro ao inserir a mensagem no banco de dados");
			error.satusCode = 501;
			throw error;
		}

		io.to(contactId).emit("appMessage", {
			action: "create",
			message: {
				...newMessage.dataValues,
				mediaUrl: `${
					message.mediaUrl
						? `http://${process.env.HOST}:${process.env.PORT}/public/${message.mediaUrl}`
						: ""
				}`,
			},
		});
		await setMessagesAsRead(contactId);

		return res.json({ message: "Mensagem enviada" });
	} catch (err) {
		next(err);
	}
};
