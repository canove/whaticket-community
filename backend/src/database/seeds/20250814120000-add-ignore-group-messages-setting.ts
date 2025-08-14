import { QueryInterface } from "sequelize";
import { ensureSetting } from "./helpers/settingUtils";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await ensureSetting(
      queryInterface,
      "ignoreGroupMessages",
      () => "disabled"
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Settings", {});
  }
};
