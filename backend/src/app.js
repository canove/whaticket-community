require("express-async-errors");
require("dotenv/config");
require("./database");
const express = require("express");
const path = require("path");
const Youch = require("youch");
const cors = require("cors");
// const sequelize = require("./database/");
const multer = require("multer");

// const wBot = require("./libs/wbot");
// const wbotMessageListener = require("./services/wbotMessageListener");
// const wbotMonitor = require("./services/wbotMonitor");

// const MessagesRoutes = require("./routes/messages");
// const ContactsRoutes = require("./routes/contacts");
const AuthRoutes = require("./routes/auth");
// const WhatsRoutes = require("./routes/whatsapp");

const app = express();

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.resolve(__dirname, "public"));
	},
	filename: (req, file, cb) => {
		cb(null, new Date().getTime() + "-" + file.originalname.replace(/\s/g, ""));
	},
});

app.use(cors());
app.use(express.json());
app.use(multer({ storage: fileStorage }).single("media"));
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/auth", AuthRoutes);

app.listen(process.env.PORT, () => {
	console.log(`Server started on port: ${process.env.PORT}`);
});

// app.use(MessagesRoutes);
// app.use(ContactsRoutes);
// app.use(WhatsRoutes);

app.use(async (err, req, res, next) => {
	if (process.env.NODE_ENV === "development") {
		const errors = await new Youch(err, req).toJSON();
		console.log(err);
		return res.status(500).json(errors);
	}
	console.log(err);
	return res.status(500).json({ error: "Internal server error" });
});

// sequelize
// 	.sync()
// 	.then(() => {
// 		const server = app.listen(process.env.PORT);
// 		const io = require("./libs/socket").init(server);
// 		io.on("connection", socket => {
// 			console.log("Client Connected");
// 			socket.on("joinChatBox", contactId => {
// 				socket.join(contactId);
// 			});

// 			socket.on("joinNotification", () => {
// 				console.log("chat entrou no canal de notificações");
// 				socket.join("notification");
// 			});

// 			socket.on("disconnect", () => {
// 				console.log("Client disconnected");
// 			});
// 		});

// 		wBot.init().then(() => {
// 			wbotMessageListener();
// 			wbotMonitor();
// 		});
// 		console.log("Server started on", process.env.PORT);
// 	})
// 	.catch(err => {
// 		console.log(err);
// 	});
