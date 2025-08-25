import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Flows", "tenantId", {
        type: DataTypes.INTEGER,
        references: { model: "Tenants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
        defaultValue: 1
      }),
      queryInterface.addColumn("Flows", "version", {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      }),
      queryInterface.addColumn("Flows", "status", {
        type: DataTypes.ENUM("draft", "active", "archived"),
        allowNull: false,
        defaultValue: "draft"
      }),
      queryInterface.addColumn("Flows", "triggerType", {
        type: DataTypes.ENUM("keyword", "intent", "event", "manual"),
        allowNull: false,
        defaultValue: "manual"
      }),
      queryInterface.addColumn("Flows", "triggerConfig", {
        type: DataTypes.JSON
      }),
      queryInterface.addColumn("Flows", "description", {
        type: DataTypes.TEXT
      }),
      queryInterface.addColumn("Flows", "isActive", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Flows", "tenantId"),
      queryInterface.removeColumn("Flows", "version"),
      queryInterface.removeColumn("Flows", "status"),
      queryInterface.removeColumn("Flows", "triggerType"),
      queryInterface.removeColumn("Flows", "triggerConfig"),
      queryInterface.removeColumn("Flows", "description"),
      queryInterface.removeColumn("Flows", "isActive")
    ]);
  }
};