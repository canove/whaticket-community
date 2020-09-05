const Sentry = require("@sentry/node");

const wbotMessageListener = require("./wbotMessageListener");

const { getIO } = require("../libs/socket");
const { getWbot, init } = require("../libs/wbot");

const wbotMonitor = dbSession => {
	const io = getIO();
	const sessionName = dbSession.name;
	const wbot = getWbot(dbSession.id);

	try {
		wbot.on("change_state", async newState => {
			console.log("Monitor session:", sessionName, newState);
			try {
				await dbSession.update({ status: newState });
			} catch (err) {
				Sentry.captureException(err);
				console.log(err);
			}

			io.emit("session", {
				action: "update",
				session: dbSession,
			});
		});

		wbot.on("change_battery", async batteryInfo => {
			const { battery, plugged } = batteryInfo;
			console.log(
				`Battery session: ${sessionName} ${battery}% - Charging? ${plugged}`
			);

			try {
				await dbSession.update({ battery, plugged });
			} catch (err) {
				Sentry.captureException(err);
				console.log(err);
			}

			io.emit("session", {
				action: "update",
				session: dbSession,
			});
		});

		wbot.on("disconnected", async reason => {
			console.log("Disconnected session:", sessionName, reason);
			try {
				await dbSession.update({ status: "disconnected" });
			} catch (err) {
				Sentry.captureException(err);
				console.log(err);
			}

			io.emit("session", {
				action: "update",
				session: dbSession,
			});

			setTimeout(
				() =>
					init(dbSession)
						.then(() => {
							wbotMessageListener(dbSession);
							wbotMonitor(dbSession);
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
