import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
   const parent: any = await queryInterface.sequelize.query(
      'SELECT id FROM whaticket.Menus WHERE name="Admin BITS" and isParent=true;'
    );

    return await queryInterface.bulkInsert(
      "Menus",
      [
        {
          name: "Contact Transfer",
          icon: "ImportExportOutlinedIcon",
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
