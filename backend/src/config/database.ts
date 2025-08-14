import { TIMEZONE_OFFSET } from "./timezone";

require("../bootstrap");

const dialect = process.env.DB_DIALECT || "mysql";

const dialectConfig = {
  mysql: {
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_bin"
    },
    timezone: TIMEZONE_OFFSET,
    dialectOptions: {
      timezone: TIMEZONE_OFFSET,
      charset: "utf8mb4",
      dateStrings: true,
      typeCast: true
    }
  },
  postgres: {
    define: {
      timestamps: true,
      underscored: false,
      underscoredAll: false,
      freezeTableName: false
    },
    timezone: TIMEZONE_OFFSET,
    dialectOptions: {
      timezone: TIMEZONE_OFFSET,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
    }
  }
} as const;

const getDefaultPort = (dbDialect: string): number => {
  return dbDialect === "postgres" ? 5432 : 3306;
};

const parseIntWithFallback = (
  value: string | undefined,
  fallback: number
): number => {
  return value ? parseInt(value, 10) || fallback : fallback;
};

module.exports = {
  ...dialectConfig[dialect as keyof typeof dialectConfig],
  dialect,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT
    ? parseInt(process.env.DB_PORT, 10)
    : getDefaultPort(dialect),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: process.env.DB_LOGGING === "true" ? console.log : false,
  pool: {
    max: parseIntWithFallback(process.env.DB_POOL_MAX, 5),
    min: parseIntWithFallback(process.env.DB_POOL_MIN, 0),
    acquire: parseIntWithFallback(process.env.DB_POOL_ACQUIRE, 30000),
    idle: parseIntWithFallback(process.env.DB_POOL_IDLE, 10000)
  }
};
