const Whatsapp = require("../models/Whatsapp");
const wbotMessageListener = require("./wbotMessageListener");

const { getIO } = require("../libs/socket");
const { getWbot, init } = require("../libs/wbot");

const wbotMonitor = () => {
	const io = getIO();
	const wbot = getWbot();

	try {
		wbot.on("change_state", newState => {
			console.log("monitor", newState);
		});

		wbot.on("change_battery", async batteryInfo => {
			// Battery percentage for attached device has changed
			const { battery, plugged } = batteryInfo;
			try {
				await Whatsapp.update({ battery, plugged }, { where: { id: 1 } });
			} catch (err) {
				console.log(err);
			}

			console.log(`Battery: ${battery}% - Charging? ${plugged}`); //todo> save batery state to db
		});

		wbot.on("disconnected", reason => {
			console.log("disconnected", reason); //todo> save connection status to DB
			setTimeout(
				() =>
					init()
						.then(res => {
							wbotMessageListener();
							wbotMonitor();
						})
						.catch(err => console.log(err)),
				2000
			);
		});

		// setInterval(() => {
		// 	wbot.resetState();
		// }, 20000);
	} catch (err) {
		console.log(err);
	}
};

module.exports = wbotMonitor;
