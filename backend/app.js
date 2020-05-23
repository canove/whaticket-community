const express = require("express");
const cors = require("cors");
const sequelize = require("./util/database");
const wBot = require("./controllers/wbot");
const Contact = require("./models/Contact");
const wbotMessageListener = require("./controllers/wbotMessageListener");

const messageRoutes = require("./routes/message");
const ContactRoutes = require("./routes/contacts");
const AuthRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

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
			console.log("Cliente Connected");
		});

		wBot.init();
		wbotMessageListener();

		console.log("Server started");
	})
	.catch(err => {
		console.log(err);
	});
