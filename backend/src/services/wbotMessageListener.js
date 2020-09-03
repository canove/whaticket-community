const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");
const { subHours } = require("date-fns");
const Sentry = require("@sentry/node");

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
		ticket = await Ticket.findOne({
			where: {
				createdAt: { [Op.between]: [subHours(new Date(), 2), new Date()] },
				contactId: contact.id,
			},
			order: [["createdAt", "DESC"]],
		});

		if (ticket) {
			await ticket.update({ status: "pending", userId: null });
		}
	}

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
	console.log("criando midia");
	if (media) {
		if (!media.filename) {
			let ext = media.mimetype.split("/")[1].split(";")[0];
			media.filename = `${new Date().getTime()}.${ext}`;
		}

		fs.writeFile(
			path.join(__dirname, "..", "..", "public", media.filename),
			media.data,
			"base64",
			err => {
				console.log(err);
			}
		);

		newMessage = await ticket.createMessage({
			id: msg.id.id,
			body: msg.body || media.filename,
			fromMe: msg.fromMe,
			mediaUrl: media.filename,
			mediaType: media.mimetype.split("/")[0],
		});
		await ticket.update({ lastMessage: msg.body || media.filename });
	}

	return newMessage;
};

const handleMessage = async (msg, ticket, contact) => {
	const io = getIO();
	let newMessage;

	if (msg.hasMedia) {
		newMessage = await handlMedia(msg, ticket);
	} else {
		newMessage = await ticket.createMessage({
			id: msg.id.id,
			body: msg.body,
			fromMe: msg.fromMe,
		});
		await ticket.update({ lastMessage: msg.body });
	}

	const serializedMessage = {
		...newMessage.dataValues,
		mediaUrl: `${
			newMessage.mediaUrl
				? `${process.env.BACKEND_URL}:${process.env.PROXY_PORT}/public/${newMessage.mediaUrl}`
				: ""
		}`,
	};

	const serializaedTicket = {
		...ticket.dataValues,
		contact: contact,
	};

	io.to(ticket.id).to("notification").emit("appMessage", {
		action: "create",
		message: serializedMessage,
		ticket: serializaedTicket,
		contact: contact,
	});
};

const wbotMessageListener = () => {
	const wbot = getWbot();
	const io = getIO();

	wbot.on("message_create", async msg => {
		console.log(msg);
		if (
			msg.from === "status@broadcast" ||
			msg.type === "location" ||
			msg.type === "call_log" ||
			msg.author != null // Ignore Group Messages
		) {
			return;
		}

		try {
			let msgContact;

			if (msg.fromMe) {
				msgContact = await wbot.getContactById(msg.to);
			} else {
				msgContact = await msg.getContact();
			}

			const profilePicUrl = await msgContact.getProfilePicUrl();
			const contact = await verifyContact(msgContact, profilePicUrl);
			const ticket = await verifyTicket(contact);

			//return if message was already created by messageController
			if (msg.fromMe) {
				const alreadyExists = await Message.findOne({
					where: { id: msg.id.id },
				});

				if (alreadyExists) {
					return;
				}
			}

			await handleMessage(msg, ticket, contact);
		} catch (err) {
			Sentry.captureException(err);
			console.log(err);
		}
	});

	wbot.on("message_ack", async (msg, ack) => {
		try {
			const messageToUpdate = await Message.findOne({
				where: { id: msg.id.id },
			});
			if (!messageToUpdate) {
				return;
			}
			await messageToUpdate.update({ ack: ack });

			io.to(messageToUpdate.ticketId).emit("appMessage", {
				action: "update",
				message: messageToUpdate,
			});
		} catch (err) {
			Sentry.captureException(err);
			console.log(err);
		}
	});
};

module.exports = wbotMessageListener;
