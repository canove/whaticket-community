import Queue from "../../database/models/Queue";

const ListQueuesService = async (
  companyId: string | number
): Promise<Queue[]> => {
  const queues = await Queue.findAll({
    where: { companyId },
    order: [["name", "ASC"]]
  });

  return queues;
};

export default ListQueuesService;
