const Contact = require("../models/Contact");
const Message = require("../models/Message");
const wbotMessageListener = require("./wbotMessageListener");

const path = require("path");
const fs = require("fs");

const { getIO } = require("../socket");
const { getWbot, init } = require("./wbot");

const wbotMonitor = () => {
	const io = getIO();
	const wbot = getWbot();

	wbot.on("change_state", newState => {
		console.log("monitor", newState);
	});

	wbot.on("change_battery", batteryInfo => {
		// Battery percentage for attached device has changed
		const { battery, plugged } = batteryInfo;
		console.log(`Battery: ${battery}% - Charging? ${plugged}`);
	});

	wbot.on("disconnected", reason => {
		console.log("disconnected", reason);
		wbot.destroy();
		setTimeout(() =>
			init()
				.then(res => {
					wbotMessageListener();
					wbotMonitor();
				})
				.catch(err => console.log(err))
		);
	});

	// setInterval(() => {
	// 	wbot.resetState();
	// }, 20000);
};

module.exports = wbotMonitor;
