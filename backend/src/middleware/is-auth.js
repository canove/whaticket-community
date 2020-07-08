const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	let decodedToken;
	try {
		const [, token] = req.get("Authorization").split(" ");
		decodedToken = jwt.verify(token, "mysecret");
		// todo >> find user in DB and store in req.user to use latter, or throw an error if user not exists anymore
		req.userId = decodedToken.userId;
	} catch (err) {
		err.statusCode = 401;
		err.message = "invalidToken";
		next(err);
	}

	if (!decodedToken) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	next();
};
