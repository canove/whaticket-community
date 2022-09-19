import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeConstraint("Contacts", "number");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeConstraint("Contacts", "number");
  }
};
