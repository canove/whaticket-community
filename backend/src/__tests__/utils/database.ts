import database from "../../database";

const truncate = async (): Promise<void> => {
  await database.truncate({ force: true, cascade: true });
};

const disconnect = async (): Promise<void> => {
  return database.connectionManager.close();
};

export { truncate, disconnect };
