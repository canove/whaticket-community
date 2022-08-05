import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("FileRegisters", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      fileId: {
        type: DataTypes.INTEGER,
        references: { model: "Files", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      documentNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      template: {
        type: DataTypes.STRING,
        allowNull: true
      },
      templateParams: {
        type: DataTypes.STRING,
        allowNull: true
      },
      message: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
      deliveredAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      readAt: {
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
    return queryInterface.dropTable("FileRegisters");
  }
};
