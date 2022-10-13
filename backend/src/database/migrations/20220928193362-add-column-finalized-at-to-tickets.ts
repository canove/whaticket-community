import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "finalizedAt", {
      type: DataTypes.BOOLEAN
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn(
      "Tickets",
      "finalizedAt"
    );
  }
};
