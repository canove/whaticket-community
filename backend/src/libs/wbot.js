const qrCode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");
const Whatsapp = require("../models/Whatsapp");
const { getIO } = require("../libs/socket");

let wbot;

module.exports = {
	init: async () => {
		let sessionCfg;

		const [dbSession] = await Whatsapp.findOrCreate({
			where: { id: 1 },
			defaults: {
				id: 1,
			},
		});
		if (dbSession && dbSession.session) {
			sessionCfg = JSON.parse(dbSession.session);
		}

		wbot = new Client({
			session: sessionCfg,
			restartOnAuthFail: true,
		});
		wbot.initialize();
		wbot.on("qr", async qr => {
			qrCode.generate(qr, { small: true });
			await dbSession.update({ id: 1, qrcode: qr, status: "disconnected" });
			getIO().emit("session", {
				action: "update",
				qr: qr,
				session: dbSession,
			});
		});
		wbot.on("authenticated", async session => {
			console.log("AUTHENTICATED");
			await dbSession.update({
				id: 1,
				session: JSON.stringify(session),
				status: "authenticated",
			});
			getIO().emit("session", {
				action: "authentication",
				session: dbSession,
			});
		});
		wbot.on("auth_failure", async msg => {
			console.error("AUTHENTICATION FAILURE", msg);
			await Whatsapp.update({ session: "" }, { where: { id: 1 } });
		});
		wbot.on("ready", async () => {
			console.log("READY");
			await dbSession.update(
				{ status: "CONNECTED", qrcode: "" },
				{ where: { id: 1 } }
			);
			// const chats = await wbot.getChats(); // pega as mensagens nao lidas (recebidas quando o bot estava offline)
			// let unreadMessages;                  // todo > salvar isso no DB pra mostrar no frontend
			// for (let chat of chats) {
			// 	if (chat.unreadCount > 0) {
			// 		unreadMessages = await chat.fetchMessages({
			// 			limit: chat.unreadCount,
			// 		});
			// 	}
			// }

			// console.log(unreadMessages);
			wbot.sendPresenceAvailable();
		});
		return { wbot, dbSession };
	},

	getWbot: () => {
		if (!wbot) {
			throw new Error("Wbot not initialized");
		}
		return wbot;
	},
};
