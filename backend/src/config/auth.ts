export default {
  secret: process.env.JWT_SECRET || "mysecret",
  expiresIn: "7d",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "myanothersecret",
  refreshExpiresIn: "7d"
};
