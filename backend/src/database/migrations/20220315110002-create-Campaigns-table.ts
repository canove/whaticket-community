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
      message1: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      message2: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      message3: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      message4: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      message5: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      confirmationMessage1: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      confirmationMessage2: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      confirmationMessage3: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      confirmationMessage4: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      confirmationMessage5: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true
      },
      confirmation: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      mediaPath: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      mediaName: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      contactListId: {
        type: DataTypes.INTEGER,
        references: { model: "ContactLists", key: "id" },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        allowNull: true
      },
      whatsappId: {
        type: DataTypes.INTEGER,
        references: { model: "Whatsapps", key: "id" },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        allowNull: true
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      completedAt: {
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
    return queryInterface.dropTable("Campaigns");
  }
};
