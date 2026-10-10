import sequelize from "../../database";

const RevokeUserSessions = async (userId: string | number): Promise<void> => {
  const queryInterface = sequelize.getQueryInterface();
  const quoteIdentifier = (identifier: string): string =>
    queryInterface.quoteIdentifier(identifier, true);
  const table = queryInterface.quoteTable("Users");

  await sequelize.query(
    `UPDATE ${table} SET ${quoteIdentifier("tokenVersion")} = ${quoteIdentifier(
      "tokenVersion"
    )} + 1 WHERE ${quoteIdentifier("id")} = :id`,
    { replacements: { id: userId } }
  );
};

export default RevokeUserSessions;
