import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("Tenants", [
      {
        id: 1,
        name: "Default Company",
        domain: null,
        planId: "basic",
        settings: JSON.stringify({}),
        status: "active",
        maxUsers: 50,
        maxWhatsapps: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Tenants", { id: 1 });
  }
};