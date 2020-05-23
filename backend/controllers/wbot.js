const path = require("path");
const qrCode = require("qrcode-terminal");
const fs = require("fs");
const { Client } = require("whatsapp-web.js");
let wbot;

module.exports = {
	init: () => {
		const SESSION_FILE_PATH = path.join(__dirname, "/session.json");
		let sessionCfg;
		if (fs.existsSync(SESSION_FILE_PATH)) {
			sessionCfg = require(SESSION_FILE_PATH);
		}
		wbot = new Client({
			session: sessionCfg,
		});
		wbot.initialize();
		wbot.on("qr", qr => {
			qrCode.generate(qr, { small: true });
		});
		wbot.on("authenticated", session => {
			console.log("AUTHENTICATED");
			sessionCfg = session;
			fs.writeFile(SESSION_FILE_PATH, JSON.stringify(sessionCfg), function (
				err
			) {
				if (err) {
					console.error(err);
				}
			});
		});
		wbot.on("auth_failure", msg => {
			console.error("AUTHENTICATION FAILURE", msg);
		});
		wbot.on("ready", () => {
			console.log("READY");
		});

		return wbot;
	},

	getWbot: () => {
		if (!wbot) {
			throw new Error("Wbot not initialized");
		}
		return wbot;
	},
};
