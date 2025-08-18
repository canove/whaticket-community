import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("FlowNodes", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      flowId: {
        type: DataTypes.INTEGER,
        references: { model: "Flows", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      config: {
        type: DataTypes.JSON
      },
      positionX: {
        type: DataTypes.FLOAT
      },
      positionY: {
        type: DataTypes.FLOAT
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("FlowNodes");
  }
};
