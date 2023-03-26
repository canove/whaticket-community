import { QueryInterface } from "sequelize";

module.exports = {
  up(queryInterface: QueryInterface) {
    return queryInterface.sequelize.query(
      "ALTER TABLE Settings DROP PRIMARY KEY"
    );
  }
};