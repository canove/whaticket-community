import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
   return queryInterface.sequelize.query("ALTER TABLE Messages DROP PRIMARY KEY, ADD CONSTRAINT Messages_PK PRIMARY KEY (id, fromMe)");
  },

  down: (queryInterface: QueryInterface) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
      return queryInterface.sequelize.query('ALTER TABLE Messages DROP CONSTRAINT Messages_PK, ADD PRIMARY KEY (id)');
  }
};
