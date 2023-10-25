import Queue from "../../models/Queue";

interface Request {
  companyId: number;
}

const ListQueuesService = async ({ companyId }: Request): Promise<Queue[]> => {
  const queues = await Queue.findAll({
    where: {
      companyId
    },
    order: [["name", "ASC"]]
  });

  return queues;
};

export default ListQueuesService;
