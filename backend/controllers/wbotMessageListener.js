const Contact = require("../models/Contact");
const Message = require("../models/Message");

const path = require("path");
const fs = require("fs");

const { getIO } = require("../socket");
const { getWbot } = require("./wbot");

const wbotMessageListener = () => {
	const io = getIO();
	const wbot = getWbot();

	wbot.on("message", async msg => {
		let newMessage;
		console.log(msg);
		const msgContact = await msg.getContact();
		const imageUrl = await msgContact.getProfilePicUrl();
		try {
			let contact = await Contact.findOne({
				where: { number: msgContact.number },
			});

			if (!contact) {
				try {
					contact = await Contact.create({
						name: msgContact.pushname || msgContact.number.toString(),
						number: msgContact.number,
						imageURL: imageUrl,
					});

					// contact.dataValues.unreadMessages = 1;

					io.to("notification").emit("contact", {
						action: "create",
						contact: contact,
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
						let aux = Math.random(5).toString();
						media.filename = aux.split(".")[1] + "." + ext;
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
						mediaUrl: path.join("public", media.filename),
						mediaType: media.mimetype.split("/")[0],
					});
				}
			} else {
				newMessage = await contact.createMessage({
					id: msg.id.id,
					messageBody: msg.body,
				});
			}

			io.to(contact.id).to("notification").emit("appMessage", {
				action: "create",
				message: newMessage,
			});

			let chat = await msg.getChat();
			chat.sendSeen();
		} catch (err) {
			console.log(err);
		}
	});

	wbot.on("message_ack", (msg, ack) => {
		// console.log("alteração do ack da msg", msg);
		try {
			const result = Message.update({ ack: ack }, { where: { id: msg.id.id } });

			if (!result) {
				const error = new Error(
					"Erro ao definir as mensagens como lidas no banco de dados"
				);
				error.satusCode = 501;
				throw error;
			}
		} catch (err) {
			console.log(err);
		}

		console.log("ack da msg", ack);
	});
};

module.exports = wbotMessageListener;
