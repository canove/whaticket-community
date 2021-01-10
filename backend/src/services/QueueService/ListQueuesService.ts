import Queue from "../../models/Queue";

const ListQueuesService = async (): Promise<Queue[]> => {
  const queues = await Queue.findAll();

  return queues;
};

export default ListQueuesService;
