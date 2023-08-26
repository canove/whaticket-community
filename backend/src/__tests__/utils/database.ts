import database from "../../database";

const truncate = async (): Promise<void> => {
  await database.query("SET FOREIGN_KEY_CHECKS = 0;")
  await database.truncate({ force: true, cascade: true });
  await database.query("SET FOREIGN_KEY_CHECKS = 1;")
};

const disconnect = async (): Promise<void> => {
  return database.connectionManager.close();
};

export { truncate, disconnect };
