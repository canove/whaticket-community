const Sentry = require("@sentry/node");

const wbotMessageListener = require("./wbotMessageListener");

const { getIO } = require("../libs/socket");
const { getWbot, initWbot } = require("../libs/wbot");

const wbotMonitor = whatsapp => {
	const io = getIO();
	const sessionName = whatsapp.name;
	const wbot = getWbot(whatsapp.id);

	try {
		wbot.on("change_state", async newState => {
			console.log("Monitor session:", sessionName, newState);
			try {
				await whatsapp.update({ status: newState });
			} catch (err) {
				Sentry.captureException(err);
				console.log(err);
			}

			io.emit("session", {
				action: "update",
				session: whatsapp,
			});
		});

		wbot.on("change_battery", async batteryInfo => {
			const { battery, plugged } = batteryInfo;
			console.log(
				`Battery session: ${sessionName} ${battery}% - Charging? ${plugged}`
			);

			try {
				await whatsapp.update({ battery, plugged });
			} catch (err) {
				Sentry.captureException(err);
				console.log(err);
			}

			io.emit("session", {
				action: "update",
				session: whatsapp,
			});
		});

		wbot.on("disconnected", async reason => {
			console.log("Disconnected session:", sessionName, reason);
			try {
				await whatsapp.update({ status: "disconnected" });
			} catch (err) {
				Sentry.captureException(err);
				console.log(err);
			}

			io.emit("session", {
				action: "update",
				session: whatsapp,
			});

			setTimeout(
				() =>
					initWbot(whatsapp)
						.then(() => {
							wbotMessageListener(whatsapp);
							wbotMonitor(whatsapp);
						})
						.catch(err => {
							Sentry.captureException(err);
							console.log(err);
						}),
				2000
			);
		});

		// setInterval(() => {
		// 	wbot.resetState();
		// }, 20000);
	} catch (err) {
		Sentry.captureException(err);
		console.log(err);
	}
};

module.exports = wbotMonitor;
