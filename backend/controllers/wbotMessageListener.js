const Contact = require("../models/Contact");
const path = require("path");
const fs = require("fs");

const { getIO } = require("../socket");
const { getWbot } = require("./wbot");

const wbotMessageListener = () => {
	getWbot().on("message", async msg => {
		let newMessage;
		const msgContact = await msg.getContact();
		const imageUrl = await msgContact.getProfilePicUrl();
		try {
			let contact = await Contact.findOne({
				where: { number: msgContact.number },
			});
			// await contact.update({ imageURL: imageUrl });

			if (!contact) {
				try {
					contact = await Contact.create({
						name: msgContact.pushname || msgContact.number.toString(),
						number: msgContact.number,
						imageURL: imageUrl,
					});

					contact.dataValues.unreadMessages = 1;

					getIO().emit("contact", {
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
						mediaUrl: path.join("public", media.filename),
						mediaType: media.mimetype.split("/")[0],
						messageBody: msg.body || media.filename,
					});
				}
			} else {
				newMessage = await contact.createMessage({
					messageBody: msg.body,
				});
			}

			getIO().to(contact.id).to("notification").emit("appMessage", {
				action: "create",
				message: newMessage,
			});

			let chat = await msg.getChat();
			chat.sendSeen();
		} catch (err) {
			console.log(err);
		}
	});
};

module.exports = wbotMessageListener;
