import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // A previous version of this migration indexed TEXT columns, which MySQL
    // rejects ("BLOB/TEXT column used in key specification without a key
    // length"), leaving a half-created table. Drop it first so re-runs succeed.
    await queryInterface.dropTable("WppKeys").catch(() => undefined);

    await queryInterface.createTable("WppKeys", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      connectionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Whatsapps",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      keyId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      value: {
        type: DataTypes.TEXT,
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

    await queryInterface.addIndex(
      "WppKeys",
      ["connectionId", "type", "keyId"],
      {
        unique: true,
        name: "wpp_keys_connection_type_key_unique"
      }
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("WppKeys");
  }
};
