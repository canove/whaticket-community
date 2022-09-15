import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeConstraint("Queues", "color");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeConstraint("Queues", "color");
  }
};
