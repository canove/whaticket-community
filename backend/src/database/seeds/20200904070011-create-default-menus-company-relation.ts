import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const menu: any = await queryInterface.sequelize.query(
      'SELECT id FROM whaticket.Menus WHERE name="Menu Link";'
    );

    return await queryInterface.bulkInsert(
      "MenuCompanies",
      [
        {
          menuId: menu[0][0].id,
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("MenuCompanies", {});
  }
};
