import { QueryInterface, QueryTypes } from "sequelize";

export const ensureSetting = async (
  queryInterface: QueryInterface,
  key: string,
  defaultValueFactory: () => string
): Promise<void> => {
  const dialect = queryInterface.sequelize.getDialect();
  const q = (name: string) =>
    dialect === "postgres" ? `"${name}"` : `\`${name}\``;
  const table = q("Settings");
  const colKey = q("key");
  const sql = `SELECT 1 FROM ${table} WHERE ${colKey} = :key LIMIT 1;`;
  const existing = await queryInterface.sequelize.query(sql, {
    replacements: { key },
    type: QueryTypes.SELECT
  });
  if (existing.length === 0) {
    await queryInterface.bulkInsert(
      "Settings",
      [
        {
          key,
          value: defaultValueFactory(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  }
};
