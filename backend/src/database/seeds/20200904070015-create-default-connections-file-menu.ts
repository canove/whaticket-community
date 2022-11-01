import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
   const parent: any = await queryInterface.sequelize.query(
      'SELECT id FROM whaticket.Menus WHERE name="WhatsApp 2" and isParent=true;'
    );

    return await queryInterface.bulkInsert(
      "Menus",
      [
        {
          name: "Connection Files",
          icon: "MenuIcon",
          parentId: parent[0][0].id,
          isParent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ],
      {}
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("MenuCompanies", {});
  }
};
