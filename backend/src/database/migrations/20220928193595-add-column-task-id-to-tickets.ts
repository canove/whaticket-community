import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "taskId", {
      type: DataTypes.INTEGER,
      references: { model: "Tasks", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "taskId");
  }
};
