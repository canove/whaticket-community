const qrCode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");
const Whatsapp = require("../models/Whatsapp");
const { getIO } = require("../libs/socket");

let sessions = [];

module.exports = {
	initWbot: async whatsapp => {
		try {
			const io = getIO();
			const sessionName = whatsapp.name;
			let sessionCfg;

			if (whatsapp && whatsapp.session) {
				sessionCfg = JSON.parse(whatsapp.session);
			}

			const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
			if (sessionIndex !== -1) {
				sessions[sessionIndex].destroy();
				sessions.splice(sessionIndex, 1);
			}

			const wbot = new Client({
				session: sessionCfg,
				restartOnAuthFail: true,
			});
			wbot.initialize();

			wbot.on("qr", async qr => {
				console.log("Session:", sessionName);

				qrCode.generate(qr, { small: true });

				await whatsapp.update({ qrcode: qr, status: "qrcode" });

				io.emit("whatsappSession", {
					action: "update",
					session: whatsapp,
				});
			});

			wbot.on("authenticated", async session => {
				console.log("Session:", sessionName, "AUTHENTICATED");

				await whatsapp.update({
					session: JSON.stringify(session),
					status: "authenticated",
				});

				io.emit("whatsappSession", {
					action: "update",
					session: whatsapp,
				});
			});

			wbot.on("auth_failure", async msg => {
				console.error("Session:", sessionName, "AUTHENTICATION FAILURE", msg);

				await whatsapp.update({ session: "" });
			});

			wbot.on("ready", async () => {
				console.log("Session:", sessionName, "READY");

				await whatsapp.update({
					status: "CONNECTED",
					qrcode: "",
				});

				io.emit("whatsappSession", {
					action: "update",
					session: whatsapp,
				});

				wbot.sendPresenceAvailable();
			});

			wbot.id = whatsapp.id;
			sessions.push(wbot);
		} catch (err) {
			console.log(err);
		}

		return null;
	},

	getWbot: sessionId => {
		console.log(sessionId);
		console.log(sessions.map(session => session.id));
		const sessionIndex = sessions.findIndex(s => s.id === sessionId);

		if (sessionIndex === -1) {
			throw new Error("This Wbot session is not initialized");
		}
		return sessions[sessionIndex];
	},

	removeWbot: sessionId => {
		try {
			const sessionIndex = sessions.findIndex(s => s.id === sessionId);
			if (sessionIndex !== -1) {
				sessions[sessionIndex].destroy();
				sessions.splice(sessionIndex, 1);
			}
		} catch (err) {
			console.log(err);
		}
	},
};
