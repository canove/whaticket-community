import AppError from "../../errors/AppError";
import Queue from "../../database/models/Queue";

const ShowQueueService = async (
  queueId: number | string,
  companyId: number | string
): Promise<Queue> => {
  const queue = await Queue.findOne({ where: { id: queueId, companyId } });

  if (!queue) {
    throw new AppError("ERR_QUEUE_NOT_FOUND");
  }

  return queue;
};

export default ShowQueueService;
