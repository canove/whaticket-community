import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("NodeRegisters", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      phoneNumber: {
        type: DataTypes.STRING
      },
      text: {
        type: DataTypes.STRING
      },
      response: {
        type: DataTypes.STRING
      },
      nodeId: {
        type: DataTypes.STRING
      },
      flowId: {
        type: DataTypes.INTEGER,
        references: { model: "Flows", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
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
    return queryInterface.dropTable("NodeRegisters");
  }
};
