import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    queryInterface.addColumn("Whatsapps", "facebookToken", {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false
    });

    queryInterface.addColumn("Whatsapps", "facebookPhoneNumberId", {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false
    });

    queryInterface.addColumn("Whatsapps", "official", {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
      unique: false
    });

    return queryInterface.addColumn("Whatsapps", "phoneNumber", {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return null;
  }
};
