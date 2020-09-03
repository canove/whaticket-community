const jwt = require("jsonwebtoken");
const util = require("util");

const User = require("../models/User");
const authConfig = require("../config/auth");

module.exports = async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({ error: "Token not provided" });
	}

	const [, token] = authHeader.split(" ");

	try {
		const decoded = await util.promisify(jwt.verify)(token, authConfig.secret);

		const user = await User.findByPk(decoded.userId, {
			attributes: ["id", "name", "profile", "email"],
		});

		if (!user) {
			return res
				.status(401)
				.json({ error: "The token corresponding user does not exists." });
		}

		req.user = user;

		return next();
	} catch (err) {
		console.log(err);
		return res.status(401).json({ error: "Invalid Token" });
	}
};
