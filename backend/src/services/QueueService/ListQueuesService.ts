import Queue from "../../database/models/Queue";

const ListQueuesService = async (): Promise<Queue[]> => {
  const queues = await Queue.findAll({ order: [["name", "ASC"]] });

  return queues;
};

export default ListQueuesService;
