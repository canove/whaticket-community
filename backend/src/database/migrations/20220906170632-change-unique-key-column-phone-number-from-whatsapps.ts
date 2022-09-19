import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeConstraint("Whatsapps", "phoneNumber");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeConstraint("Whatsapps", "phoneNumber");
  }
};
