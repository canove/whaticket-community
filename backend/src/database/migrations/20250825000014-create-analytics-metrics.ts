import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("AnalyticsMetrics", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      tenantId: {
        type: DataTypes.INTEGER,
        references: { model: "Tenants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      metricType: {
        type: DataTypes.ENUM(
          "response_time",
          "resolution_rate", 
          "flow_effectiveness",
          "campaign_roi",
          "user_activity",
          "contact_engagement",
          "ticket_volume",
          "ai_usage",
          "api_usage",
          "custom"
        ),
        allowNull: false
      },
      value: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: true
      },
      period: {
        type: DataTypes.ENUM("hourly", "daily", "weekly", "monthly", "yearly"),
        allowNull: false,
        defaultValue: "daily"
      },
      periodStart: {
        type: DataTypes.DATE,
        allowNull: false
      },
      periodEnd: {
        type: DataTypes.DATE,
        allowNull: false
      },
      dimensions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      },
      createdAt: {
        type: DataTypes.DATE(6),
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE(6),
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("AnalyticsMetrics");
  }
};