const fs = require("fs");
const Message = require("../models/Message");
const Contact = require("../models/Contact");
const io = require("../socket");

const wbot = require("./wbot");
const { MessageMedia } = require("whatsapp-web.js");

exports.getContactMessages = async (req, res, next) => {
	const { contactId } = req.params;

	try {
		const contact = await Contact.findByPk(contactId);
		const contactMessages = await contact.getMessages();

		const result = await Message.update(
			{ read: true },
			{
				where: {
					contactId: contactId,
					read: false,
				},
			}
		);

		return res.json(contactMessages);
	} catch (err) {
		next(err);
	}
};

exports.postCreateContactMessage = async (req, res, next) => {
	const { contactId } = req.params;
	const message = req.body;
	const media = req.file;

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

			wbot.getWbot().sendMessage(`${contact.number}@c.us`, newMedia);
		} else {
			wbot.getWbot().sendMessage(`${contact.number}@c.us`, message.messageBody);
		}

		const newMessage = await contact.createMessage(message);
		if (!newMessage) {
			const error = new Error("Erro ao inserir a mensagem no banco de dados");
			error.satusCode = 501;
			throw error;
		}

		io.getIO().to(contactId).emit("appMessage", {
			action: "create",
			message: newMessage,
		});

		return res.json({ message: "Mensagem enviada" });
	} catch (err) {
		next(err);
	}
};
