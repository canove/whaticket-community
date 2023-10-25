import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("CampaignShipping", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      jobId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      number: {
        type: DataTypes.STRING,
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      confirmationMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      confirmation: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      contactId: {
        type: DataTypes.INTEGER,
        references: { model: "ContactListItems", key: "id" },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        allowNull: true
      },
      campaignId: {
        type: DataTypes.INTEGER,
        references: { model: "Campaigns", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      confirmationRequestedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      confirmedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      deliveredAt: {
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
    return queryInterface.dropTable("CampaignShipping");
  }
};
