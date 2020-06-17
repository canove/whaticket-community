const Contact = require("../models/Contact");
const Message = require("../models/Message");

const path = require("path");
const fs = require("fs");

const { getIO } = require("../socket");
const { getWbot, init } = require("./wbot");

const wbotMessageListener = () => {
	const io = getIO();
	const wbot = getWbot();

	wbot.on("message", async msg => {
		let newMessage;
		// console.log(msg);
		if (msg.from === "status@broadcast") {
			return;
		}
		try {
			const msgContact = await msg.getContact();
			const imageUrl = await msgContact.getProfilePicUrl();
			try {
				let contact = await Contact.findOne({
					where: { number: msgContact.number },
				});

				if (contact) {
					await contact.update({ imageURL: imageUrl });
				}

				if (!contact) {
					try {
						contact = await Contact.create({
							name: msgContact.pushname || msgContact.number.toString(),
							number: msgContact.number,
							imageURL: imageUrl,
						});
					} catch (err) {
						console.log(err);
					}
				}
				if (msg.hasMedia) {
					const media = await msg.downloadMedia();

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

						newMessage = await contact.createMessage({
							id: msg.id.id,
							messageBody: msg.body || media.filename,
							mediaUrl: media.filename,
							mediaType: media.mimetype.split("/")[0],
						});
						await contact.update({ lastMessage: msg.body || media.filename });
					}
				} else {
					newMessage = await contact.createMessage({
						id: msg.id.id,
						messageBody: msg.body,
					});
					await contact.update({ lastMessage: msg.body });
				}

				io.to(contact.id)
					.to("notification")
					.emit("appMessage", {
						action: "create",
						message: {
							...newMessage.dataValues,
							mediaUrl: `${
								newMessage.mediaUrl
									? `http://localhost:8080/public/${newMessage.mediaUrl}`
									: ""
							}`,
						},
						contact: {
							...contact.dataValues,
							unreadMessages: 1,
							lastMessage: newMessage.messageBody,
						},
					});

				let chat = await msg.getChat();
				chat.sendSeen();
			} catch (err) {
				console.log(err);
			}
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
				error.satusCode = 501;
				throw error;
			}
			await messageToUpdate.update({ ack: ack });

			io.to(messageToUpdate.contactId).emit("appMessage", {
				action: "update",
				message: messageToUpdate,
			});
		} catch (err) {
			console.log(err);
		}
	});
};

module.exports = wbotMessageListener;
