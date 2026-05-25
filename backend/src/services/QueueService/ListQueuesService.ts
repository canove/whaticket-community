import Queue from "../../models/Queue.js";

const ListQueuesService = async (): Promise<Queue[]> => {
  const queues = await Queue.findAll({ order: [["name", "ASC"]] });

  return queues;
};

export default ListQueuesService;
