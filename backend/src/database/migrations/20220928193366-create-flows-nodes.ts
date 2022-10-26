import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("FlowsNodes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      flowId: {
        type: DataTypes.INTEGER,
        references: { model: "Flows", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      json: {
        type: DataTypes.TEXT({ length: "long" })
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("FlowsNodes");
  }
};
