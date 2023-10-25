import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Companies", "status", {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }),
      queryInterface.addColumn("Companies", "schedules", {
        type: DataTypes.JSONB,
        defaultValue: []
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Companies", "schedules"),
      queryInterface.removeColumn("Companies", "status")
    ]);
  }
};
