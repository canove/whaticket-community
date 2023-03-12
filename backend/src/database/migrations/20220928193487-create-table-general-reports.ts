import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("GeneralReports", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      imported: {
        type: DataTypes.INTEGER
      },
      sent: {
        type: DataTypes.INTEGER
      },
      delivered: {
        type: DataTypes.INTEGER
      },
      read: {
        type: DataTypes.INTEGER
      },
      error: {
        type: DataTypes.INTEGER
      },
      interaction: {
        type: DataTypes.INTEGER
      },
      noWhats: {
        type: DataTypes.INTEGER
      },
      sentMessages: {
        type: DataTypes.INTEGER
      },
      receivedMessages: {
        type: DataTypes.INTEGER
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
    return queryInterface.dropTable("GeneralReports");
  }
};
