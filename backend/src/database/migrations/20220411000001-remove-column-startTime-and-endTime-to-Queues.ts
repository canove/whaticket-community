import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Queues", "startTime"),
      queryInterface.removeColumn("Queues", "endTime"),
      queryInterface.removeColumn("Queues", "outOfHoursMessage")
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Queues", "startTime", {
        type: DataTypes.STRING,
        defaultValue: null
      }),
      queryInterface.addColumn("Queues", "endTime", {
        type: DataTypes.STRING,
        defaultValue: null
      }),
      queryInterface.addColumn("Queues", "outOfHoursMessage", {
        type: DataTypes.TEXT,
        defaultValue: null
      })
    ]);
  }
};
