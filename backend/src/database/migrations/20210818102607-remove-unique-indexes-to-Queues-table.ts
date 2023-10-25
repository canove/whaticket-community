import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeConstraint("Queues", "Queues_color_key"),
      queryInterface.removeConstraint("Queues", "Queues_name_key"),
      queryInterface.removeIndex("Queues", "Queues_color_key"),
      queryInterface.removeIndex("Queues", "Queues_name_key"),
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addConstraint("Queues", ["color"], {
        name: "Queues_color_key",
        type: 'unique'
      }),
      queryInterface.addConstraint("Queues", ["name"], {
        name: "Queues_name_key",
        type: 'unique'
      }),
    ]);
  }
};
