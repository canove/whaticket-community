import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("WhatsappGroupsWhatsapps", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      whatsappId: {
        type: DataTypes.INTEGER,
        references: { model: "Whatsapps", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      whatsappGroupId: {
        type: DataTypes.INTEGER,
        references: { model: "WhatsappGroups", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      processedAt: {
        type: DataTypes.DATE
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
    return queryInterface.dropTable("WhatsappGroupsWhatsapps");
  }
};
