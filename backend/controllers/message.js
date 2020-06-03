const fs = require("fs");
const Message = require("../models/Message");
const Contact = require("../models/Contact");
const { getIO } = require("../socket");
const { getWbot } = require("./wbot");

const { MessageMedia } = require("whatsapp-web.js");

const setMessagesAsRead = async contactId => {
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
	} catch (err) {
		next(err);
	}
};

exports.getContactMessages = async (req, res, next) => {
	const wbot = getWbot();
	const io = getIO();

	const { contactId } = req.params;
	const { search, page = 1 } = req.query;

	let limit = 5;
	let offset = limit * (page - 1);

	try {
		const contact = await Contact.findByPk(contactId);
		if (!contact) {
			const error = new Error("Erro ao localizar o contato no banco de dados");
			error.satusCode = 501;
			throw error;
		}

		setMessagesAsRead(contactId);

		const contactMessages = await contact.getMessages({
			limit,
			offset,
			order: [["createdAt", "DESC"]],
		});

		return res.json(contactMessages.reverse());
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
			message.mediaUrl = req.file.path;
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
			message: newMessage,
		});

		return res.json({ message: "Mensagem enviada" });
	} catch (err) {
		next(err);
	}
};
