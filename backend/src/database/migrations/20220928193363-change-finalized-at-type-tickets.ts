import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("Tickets", "finalizedAt", {
        type: DataTypes.DATE,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("Tickets", "finalizedAt", {
        type: DataTypes.BOOLEAN
      })
    ]);
  }
};
