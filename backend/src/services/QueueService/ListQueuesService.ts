import Queue from "../../database/models/Queue";

interface Request {
  companyId: string | number;
  selectedCompany: string;
}

const ListQueuesService = async ({
  companyId,
  selectedCompany,
}: Request): Promise<Queue[]> => {
  let whereCondition = null;

  whereCondition = { companyId };

  if (companyId === 1 && selectedCompany) whereCondition = { companyId: selectedCompany };

  const queues = await Queue.findAll({
    where: whereCondition,
    order: [["name", "ASC"]],
    include: [
      {
        model: Queue,
        as: "overflowQueue",
        attributes: ["name"],
        required: false,
      }
    ]
  });

  return queues;
};

export default ListQueuesService;
