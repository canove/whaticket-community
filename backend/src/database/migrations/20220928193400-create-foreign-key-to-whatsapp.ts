import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addConstraint("FileRegisters", ["whatsappId"], {
      type: "foreign key",
      references: {
        table: 'Whatsapps',
        field: 'id',
      },
      onDelete: 'no action',
      onUpdate: 'no action',
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeConstraint("FileRegisters", "whatsappId");
  }
};
