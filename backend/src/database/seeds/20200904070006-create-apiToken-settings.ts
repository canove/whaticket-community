import { QueryInterface } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { ensureSetting } from "./helpers/settingUtils";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await ensureSetting(queryInterface, "userApiToken", () => uuidv4());
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Settings", {});
  }
};
