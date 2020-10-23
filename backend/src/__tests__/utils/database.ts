import database from "../../database";

const truncate = async (): Promise<void> => {
  await database.sync({ force: true });
};

const disconnect = async (): Promise<void> => {
  return database.connectionManager.close();
};

export { truncate, disconnect };
