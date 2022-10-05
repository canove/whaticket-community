import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("GreetingMessageControls", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      templateId: {
        type: DataTypes.INTEGER,
        references: { model: "Templates", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      greetingMessageId: {
        type: DataTypes.INTEGER,
        references: { model: "GreetingMessages", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      phoneNumber: {
        type: DataTypes.STRING
      },
      sendAt: {
        type: DataTypes.DATE,
        allowNull: true
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
    return queryInterface.dropTable("GreetingMessageControls");
  }
};
