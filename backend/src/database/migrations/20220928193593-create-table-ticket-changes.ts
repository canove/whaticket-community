import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TicketChanges", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      ticketId: {
        type: DataTypes.INTEGER,
        references: { model: "Tickets", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      oldUserId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      newUserId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      oldQueueId: {
        type: DataTypes.INTEGER,
        references: { model: "Queues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      newQueueId: {
        type: DataTypes.INTEGER,
        references: { model: "Queues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      oldStatus: {
        type: DataTypes.STRING,
      },
      newStatus: {
        type: DataTypes.STRING,
      },
      observation: {
        type: DataTypes.STRING,
      },
      change: {
        type: DataTypes.STRING,
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
    return queryInterface.dropTable("TicketChanges");
  }
};
