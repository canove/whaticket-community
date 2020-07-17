const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth");

module.exports = (req, res, next) => {
	let decodedToken;

	const [, token] = req.get("Authorization").split(" ");
	decodedToken = jwt.verify(token, authConfig.secret);
	// todo >> find user in DB and store in req.user to use latter, or throw an error if user not exists anymore
	req.userId = decodedToken.userId;

	if (!decodedToken) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	next();
};
