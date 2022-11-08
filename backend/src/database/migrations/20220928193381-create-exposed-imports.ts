import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("ExposedImports", {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING
      },
      mapping: {
        type: DataTypes.TEXT({ length: "long" })
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      deletedAt: {
        allowNull: true,
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
    return queryInterface.dropTable("ExposedImports");
  }
};
