const { resolve } = require("path");

module.exports = {
  "config": resolve(__dirname, "src", "config", "database.cjs"),
  "models-path": resolve(__dirname, "dist", "models"),
  "migrations-path": resolve(__dirname, "dist", "database", "migrations"),
  "seeders-path": resolve(__dirname, "dist", "database", "seeds")
};
