require("express-async-errors");
require("./database");
const express = require("express");
const path = require("path");
const Youch = require("youch");
const cors = require("cors");
const multer = require("multer");
const Sentry = require("@sentry/node");

const wBot = require("./libs/wbot");
const wbotMessageListener = require("./services/wbotMessageListener");
const wbotMonitor = require("./services/wbotMonitor");
const Whatsapp = require("./models/Whatsapp");

const Router = require("./router");

const app = express();

const server = app.listen(process.env.PORT, () => {
	console.log(`Server started on port: ${process.env.PORT}`);
});

Sentry.init({ dsn: process.env.SENTRY_DSN });

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.resolve(__dirname, "..", "public"));
	},
	filename: (req, file, cb) => {
		cb(null, new Date().getTime() + path.extname(file.originalname));
	},
});

app.use(Sentry.Handlers.requestHandler());
app.use(cors());
app.use(express.json());
app.use(multer({ storage: fileStorage }).single("media"));
app.use("/public", express.static(path.join(__dirname, "..", "public")));
app.use(Router);

const io = require("./libs/socket").init(server);
io.on("connection", socket => {
	console.log("Client Connected");
	socket.on("joinChatBox", ticketId => {
		console.log("A client joined a ticket channel");
		socket.join(ticketId);
	});

	socket.on("joinNotification", () => {
		console.log("A client joined notification channel");
		socket.join("notification");
	});

	socket.on("disconnect", () => {
		console.log("Client disconnected");
	});
});

const startWhatsAppSessions = async () => {
	const whatsapps = await Whatsapp.findAll();

	if (whatsapps.length > 0) {
		whatsapps.forEach(dbSession => {
			wBot
				.init(dbSession)
				.then(() => {
					wbotMessageListener(dbSession);
					wbotMonitor(dbSession);
				})
				.catch(err => console.log(err));
		});
	}
};
startWhatsAppSessions();

// wBot
// 	.init()
// 	.then(({ dbSession }) => {
// 		wbotMessageListener();
// 		wbotMonitor(dbSession);
// 	})
// 	.catch(err => console.log(err));

app.use(Sentry.Handlers.errorHandler());

app.use(async (err, req, res, next) => {
	if (process.env.NODE_ENV === "DEVELOPMENT") {
		const errors = await new Youch(err, req).toJSON();
		console.log(err);
		return res.status(500).json(errors);
	}
	return res.status(500).json({ error: "Internal server error" });
});
