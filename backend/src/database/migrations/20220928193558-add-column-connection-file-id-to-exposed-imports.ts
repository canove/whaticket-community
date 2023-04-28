import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("ExposedImports", "connectionFileId", {
      type: DataTypes.INTEGER,
      references: { model: "ConnectionFiles", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("ExposedImports", "connectionFileId");
  }
};
