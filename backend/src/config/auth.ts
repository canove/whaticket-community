export default {
  secret: process.env.JWT_SECRET || "default_secret",
  expiresIn: "7d",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
  refreshExpiresIn: "7d"
};
