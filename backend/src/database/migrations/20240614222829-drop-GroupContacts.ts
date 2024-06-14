import { DataTypes, INTEGER, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("GroupContacts");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("GroupContacts", {
      groupContactId: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false
      },
      participantContactId: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false
      },
      whatsappId: {
        type: INTEGER,
        references: { model: "Whatsapps", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
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
  }
};
