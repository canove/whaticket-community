import Category from "../../models/Category";
import Queue from "../../models/Queue";
import User from "../../models/User";

const ListQueuesService = async (): Promise<Queue[]> => {
  const queues = await Queue.findAll({
    include: [
      {
        model: Category,
        as: "categories",
        attributes: ["id", "name", "color"]
      },
      {
        model: User,
        as: "users",
        required: false
      }
    ],
    order: [["name", "ASC"]]
  });

  return queues;
};

export default ListQueuesService;
