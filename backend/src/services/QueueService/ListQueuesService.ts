import Category from "../../models/Category";
import Queue from "../../models/Queue";

const ListQueuesService = async (): Promise<Queue[]> => {
  const queues = await Queue.findAll({
    include: [
      {
        model: Category,
        as: "categories",
        attributes: ["id", "name", "color"]
      }
    ],
    order: [["name", "ASC"]]
  });

  return queues;
};

export default ListQueuesService;
