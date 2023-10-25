import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Queues", "schedules", {
        type: DataTypes.JSONB,
        defaultValue: []
      }),
      queryInterface.addColumn("Queues", "outOfHoursMessage", {
        type: DataTypes.TEXT,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Queues", "schedules"),
      queryInterface.removeColumn("Queues", "outOfHoursMessage")
    ]);
  }
};
