const io = require("../socket");
const Contact = require("../models/Contact");

const wbot = require("./wbot");

const wbotMessageListener = () => {
	wbot.getWbot().on("message", async msg => {
		const msgContact = await msg.getContact();
		try {
			let contact = await Contact.findOne({
				where: { number: msgContact.number },
			});
			if (!contact) {
				try {
					contact = await Contact.create({
						name: msgContact.number.toString(),
						number: msgContact.number,
						imageUrl: "",
					});
					io.getIO().emit("contact", {
						action: "create",
						contact: contact.dataValues,
					});
				} catch (err) {
					console.log(err);
				}
			}

			const newMessage = await contact.createMessage({
				messageBody: msg.body,
			});
			io.getIO().emit("appMessage", {
				action: "create",
				message: newMessage.dataValues,
			});
		} catch (err) {
			console.log(err);
		}
	});
};

module.exports = wbotMessageListener;
