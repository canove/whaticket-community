const jwt = require("jsonwebtoken");

const authConfig = require("../config/auth");

module.exports = async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({ error: "Token not provided" });
	}

	const [, token] = authHeader.split(" ");

	jwt.verify(token, authConfig.secret, (error, result) => {
		if (error) {
			return res.status(401).json({ error: "Invalid token" });
		}
		req.userId = result.userId;
		// todo >> find user in DB and store in req.user to use latter, or throw an error if user not exists anymore
		next();
	});
};
