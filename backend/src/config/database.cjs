// CJS version used exclusively by sequelize-cli.
// The app uses src/config/database.ts (ESM) instead.
const path = require("path");
require("dotenv").config({
  path: process.env.NODE_ENV === "test"
    ? path.resolve(__dirname, "..", ".env.test")
    : path.resolve(__dirname, "..", ".env")
});

const SUPPORTED_DIALECTS = [
  "mssql", "mariadb", "mysql", "oracle", "postgres", "db2", "sqlite"
];
const envDialect = process.env.DB_DIALECT;
const dialect =
  envDialect && SUPPORTED_DIALECTS.includes(envDialect) ? envDialect : "postgres";

module.exports = {
  dialect,
  timezone: "America/Sao_Paulo",
  host: process.env.DB_HOST,
  port: (() => {
    const parsed = parseInt(process.env.DB_PORT || "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 5432;
  })(),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: false,
  pool: { max: 30, min: 5, acquire: 30000, idle: 10000, evict: 1000 }
};
