const Message = require("../models/Message");
const Contact = require("../models/Contact");
const io = require("../socket");

const wbot = require("./wbot");

exports.getContactMessages = async (req, res) => {
	const { contactId } = req.params;
	const contact = await Contact.findByPk(contactId);

	const contactMessages = await contact.getMessages();

	return res.json(contactMessages);
};

exports.postCreateContactMessage = async (req, res) => {
	const { contactId } = req.params;
	const message = req.body;

	const contact = await Contact.findByPk(contactId);

	const newMessage = await contact.createMessage(message);

	if (!newMessage) {
		return res.status(500).json({ message: "A mensagem não foi criada" });
	}

	wbot.getWbot().sendMessage(`${contact.number}@c.us`, message.messageBody);

	io.getIO().emit("appMessage", {
		action: "create",
		message: newMessage.dataValues,
	});

	return res.json(newMessage);
};

exports.postUpdateMessageStatus = async (req, res) => {
	const { messagesToSetRead } = req.body;

	await Promise.all(
		messagesToSetRead.map(async message => {
			await Message.update(
				{ read: 1 },
				{
					where: {
						id: message.id,
					},
				}
			);
		})
	);

	res.json({ message: "Mensagens lidas!" });
};
