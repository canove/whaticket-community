import { QueryInterface, QueryTypes } from "sequelize";
import { hash } from "bcryptjs";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const dialect = queryInterface.sequelize.getDialect();
    const q = (name: string) =>
      dialect === "postgres" ? `"${name}"` : `\`${name}\``;
    const usersTable = q("Users");
    const sqlUsers = `SELECT id FROM ${usersTable} LIMIT 1;`;
    const existingAdminUsers = await queryInterface.sequelize.query(sqlUsers, {
      type: QueryTypes.SELECT
    });

    if (existingAdminUsers.length === 0) {
      const plain = process.env.ADMIN_INITIAL_PASSWORD || "admin";
      const passwordHash = await hash(plain, 8);

      return queryInterface.bulkInsert("Users", [
        {
          name: "Administrador",
          email: "admin@whaticket.com",
          passwordHash,
          profile: "admin",
          tokenVersion: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    }

    return Promise.resolve();
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {});
  }
};
