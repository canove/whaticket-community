const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");

const Contact = require("../models/Contact");
const Ticket = require("../models/Ticket");
const Message = require("../models/Message");

const { getIO } = require("../libs/socket");
const { getWbot, init } = require("../libs/wbot");

const verifyContact = async (msgContact, profilePicUrl) => {
	let contact = await Contact.findOne({
		where: { number: msgContact.number },
	});

	if (contact) {
		await contact.update({ profilePicUrl: profilePicUrl });
	} else {
		contact = await Contact.create({
			name: msgContact.pushname || msgContact.number.toString(),
			number: msgContact.number,
			profilePicUrl: profilePicUrl,
		});
	}

	return contact;
};

const verifyTicket = async contact => {
	let ticket = await Ticket.findOne({
		where: {
			status: {
				[Op.or]: ["open", "pending"],
			},
			contactId: contact.id,
		},
	});

	if (!ticket) {
		ticket = await Ticket.create({
			contactId: contact.id,
			status: "pending",
		});
	}

	return ticket;
};

const handlMedia = async (msg, ticket) => {
	const media = await msg.downloadMedia();
	let newMessage;

	if (media) {
		if (!media.filename) {
			let ext = media.mimetype.split("/")[1].split(";")[0];
			media.filename = `${new Date().getTime()}.${ext}`;
		}

		fs.writeFile(
			path.join(__dirname, "..", "public", media.filename),
			media.data,
			"base64",
			err => {
				console.log(err);
			}
		);

		newMessage = await ticket.createMessage({
			id: msg.id.id,
			body: msg.body || media.filename,
			mediaUrl: media.filename,
			mediaType: media.mimetype.split("/")[0],
		});
		await ticket.update({ lastMessage: msg.body || media.filename });
	}

	return newMessage;
};

const wbotMessageListener = () => {
	const io = getIO();
	const wbot = getWbot();

	wbot.on("message", async msg => {
		// console.log(msg);

		let newMessage;

		if (msg.from === "status@broadcast" || msg.type === "location") {
			return;
		}

		try {
			const msgContact = await msg.getContact();
			const profilePicUrl = await msgContact.getProfilePicUrl();

			const contact = await verifyContact(msgContact, profilePicUrl);

			const ticket = await verifyTicket(contact);

			// if (msg.hasQuotedMsg) {
			// 	const quotedMessage = await msg.getQuotedMessage();
			// 	console.log("quoted", quotedMessage);
			// }

			if (msg.hasMedia) {
				newMessage = await handlMedia(msg, ticket);
			} else {
				newMessage = await ticket.createMessage({
					id: msg.id.id,
					body: msg.body,
				});
				await ticket.update({ lastMessage: msg.body });
			}

			const serializedMessage = {
				...newMessage.dataValues,
				mediaUrl: `${
					newMessage.mediaUrl
						? `http://${process.env.HOST}:${process.env.PORT}/public/${newMessage.mediaUrl}`
						: ""
				}`,
			};

			const serializaedTicket = {
				...ticket.dataValues,
				unreadMessages: 1,
				lastMessage: newMessage.body,
			};

			io.to(ticket.id).to("notification").emit("appMessage", {
				action: "create",
				message: serializedMessage,
				ticket: serializaedTicket,
			});

			let chat = await msg.getChat();
			chat.sendSeen();
		} catch (err) {
			console.log(err);
		}
	});

	wbot.on("message_ack", async (msg, ack) => {
		try {
			const messageToUpdate = await Message.findOne({
				where: { id: msg.id.id },
			});
			if (!messageToUpdate) {
				// will throw an error is msg wasn't sent from app
				const error = new Error(
					"Erro ao alterar o ack da mensagem no banco de dados"
				);
				error.statusCode = 501;
				throw error;
			}
			await messageToUpdate.update({ ack: ack });

			io.to(messageToUpdate.ticketId).emit("appMessage", {
				action: "update",
				message: messageToUpdate,
			});
		} catch (err) {
			console.log(err);
		}
	});
};

module.exports = wbotMessageListener;
