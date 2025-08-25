import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("AudioTranscriptions", {
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
      messageId: {
        type: DataTypes.STRING,
        references: { model: "Messages", key: "id" },
        onUpdate: "CASCADE", 
        onDelete: "CASCADE",
        allowNull: false
      },
      audioUrl: {
        type: DataTypes.STRING,
        allowNull: false
      },
      transcription: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      confidence: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      provider: {
        type: DataTypes.ENUM("openai", "azure", "google", "local"),
        allowNull: false,
        defaultValue: "openai"
      },
      status: {
        type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
        allowNull: false,
        defaultValue: "pending"
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      processingTimeMs: {
        type: DataTypes.INTEGER,
        allowNull: true
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
    return queryInterface.dropTable("AudioTranscriptions");
  }
};