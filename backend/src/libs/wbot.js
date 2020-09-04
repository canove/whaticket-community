const qrCode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");
const Whatsapp = require("../models/Whatsapp");
const { getIO } = require("../libs/socket");

let sessions = [];

module.exports = {
	init: async dbSession => {
		const sessionName = dbSession.name;
		let sessionCfg;

		if (dbSession && dbSession.session) {
			sessionCfg = JSON.parse(dbSession.session);
		}

		const wbot = new Client({
			session: sessionCfg,
			restartOnAuthFail: true,
		});
		wbot.initialize();
		wbot.on("qr", async qr => {
			console.log("Session:", sessionName);
			qrCode.generate(qr, { small: true });
			await dbSession.update({ id: 1, qrcode: qr, status: "disconnected" });
			getIO().emit("session", {
				action: "update",
				qr: qr,
				session: dbSession,
			});
		});
		wbot.on("authenticated", async session => {
			console.log("Session:", sessionName, "AUTHENTICATED");
			await dbSession.update({
				session: JSON.stringify(session),
				status: "authenticated",
			});
			getIO().emit("session", {
				action: "authentication",
				session: dbSession,
			});
		});
		wbot.on("auth_failure", async msg => {
			console.error("Session:", sessionName, "AUTHENTICATION FAILURE", msg);
			await dbSession.update({ session: "" });
		});
		wbot.on("ready", async () => {
			console.log("Session:", sessionName, "READY");
			await dbSession.update({
				status: "CONNECTED",
				qrcode: "",
			});

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
			// wbot.sendPresenceAvailable();
		});

		wbot.name = sessionName;
		sessions.push(wbot);
		return null;
	},

	getWbot: sessionName => {
		const sessionIndex = sessions.findIndex(s => s.name === sessionName);

		if (sessionIndex === -1) {
			throw new Error("This Wbot session is not initialized");
		}
		return sessions[sessionIndex];
	},
};
