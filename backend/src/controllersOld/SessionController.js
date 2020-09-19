const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth");

const User = require("../models/User");

exports.store = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email: email } });
  if (!user) {
    return res.status(404).json({ error: "No user found with this email" });
  }

  if (!(await user.checkPassword(password))) {
    return res.status(401).json({ error: "Password does not match" });
  }

  const token = jwt.sign(
    { email: user.email, userId: user.id },
    authConfig.secret,
    {
      expiresIn: authConfig.expiresIn
    }
  );

  return res.status(200).json({
    token: token,
    username: user.name,
    profile: user.profile,
    userId: user.id
  });
};
