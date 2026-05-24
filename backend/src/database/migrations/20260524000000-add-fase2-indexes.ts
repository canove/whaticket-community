import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Tickets.createdAt — used by CountTicketsByUserService date range and
    // ListTicketsService date filter; plain B-tree is enough here.
    await queryInterface.sequelize.query(
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS tickets_created_at_idx ON "Tickets" ("createdAt")`
    );

    // Enable pg_trgm for fast ILIKE searches on Contacts.name / number
    await queryInterface.sequelize.query(
      `CREATE EXTENSION IF NOT EXISTS pg_trgm`
    );

    await queryInterface.sequelize.query(
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS contacts_name_trgm_idx ON "Contacts" USING GIN (name gin_trgm_ops)`
    );

    await queryInterface.sequelize.query(
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS contacts_number_trgm_idx ON "Contacts" USING GIN (number gin_trgm_ops)`
    );
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS tickets_created_at_idx`
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS contacts_name_trgm_idx`
    );
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS contacts_number_trgm_idx`
    );
    // Note: does not drop pg_trgm extension as it may be used by other objects
  }
};
