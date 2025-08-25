import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Campaigns", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      type: {
        type: DataTypes.ENUM("instant", "scheduled", "recurring"),
        allowNull: false,
        defaultValue: "instant"
      },
      status: {
        type: DataTypes.ENUM("draft", "scheduled", "running", "paused", "completed", "cancelled", "failed"),
        allowNull: false,
        defaultValue: "draft"
      },
      targetAudience: {
        type: DataTypes.JSON,
        allowNull: true
      },
      messageTemplate: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      recurringConfig: {
        type: DataTypes.JSON,
        allowNull: true
      },
      statistics: {
        type: DataTypes.JSON,
        allowNull: true
      },
      messagesPerSecond: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Tenants",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
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
    return queryInterface.dropTable("Campaigns");
  }
};