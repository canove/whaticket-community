require("../bootstrap");

module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin"
  },
  dialect: process.env.DB_DIALECT || "mysql",
  timezone: "-03:00",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "whaticket",
  username: process.env.DB_USER || "whaticket",
  password: process.env.DB_PASS || "whaticket",
  logging: false
};
