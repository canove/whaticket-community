const express = require("express");
const path = require("path");
const cors = require("cors");
const sequelize = require("./util/database");
const multer = require("multer");

const wBot = require("./controllers/wbot");
const Contact = require("./models/Contact");
const wbotMessageListener = require("./controllers/wbotMessageListener");

const messageRoutes = require("./routes/message");
const ContactRoutes = require("./routes/contacts");
const AuthRoutes = require("./routes/auth");

const app = express();

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public");
	},
	filename: (req, file, cb) => {
		cb(null, new Date().getTime() + "-" + file.originalname.replace(/\s/g, ""));
	},
});

app.use(cors());
app.use(express.json());
app.use(multer({ storage: fileStorage }).single("media"));
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(messageRoutes);
app.use(ContactRoutes);
app.use("/auth", AuthRoutes);

app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message: message, data: data });
});

sequelize
	.sync()
	.then(() => {
		const server = app.listen(8080);
		const io = require("./socket").init(server);
		io.on("connection", socket => {
			console.log("Client Connected");
			socket.on("joinChatBox", contactId => {
				socket.join(contactId);
			});

			socket.on("joinNotification", () => {
				console.log("chat entrou no canal de notificações");
				socket.join("notification");
			});

			socket.on("disconnect", () => {
				console.log("Client disconnected");
			});
		});

		wBot.init();
		wbotMessageListener();

		console.log("Server started");
	})
	.catch(err => {
		console.log(err);
	});
