import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("FlowNodes", "nodeId", {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
      }),
      queryInterface.addColumn("FlowNodes", "label", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn("FlowNodes", "data", {
        type: DataTypes.JSON,
        allowNull: true
      }),
      queryInterface.addColumn("FlowNodes", "sourcePosition", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "right"
      }),
      queryInterface.addColumn("FlowNodes", "targetPosition", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "left"
      }),
      queryInterface.addColumn("FlowNodes", "width", {
        type: DataTypes.FLOAT,
        allowNull: true
      }),
      queryInterface.addColumn("FlowNodes", "height", {
        type: DataTypes.FLOAT,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("FlowNodes", "nodeId"),
      queryInterface.removeColumn("FlowNodes", "label"),
      queryInterface.removeColumn("FlowNodes", "data"),
      queryInterface.removeColumn("FlowNodes", "sourcePosition"),
      queryInterface.removeColumn("FlowNodes", "targetPosition"),
      queryInterface.removeColumn("FlowNodes", "width"),
      queryInterface.removeColumn("FlowNodes", "height")
    ]);
  }
};