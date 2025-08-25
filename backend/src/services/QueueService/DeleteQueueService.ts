import ShowQueueService from "./ShowQueueService";
import UserQueu from "../../models/UserQueue";
import UserQueue from "../../models/UserQueue";

const DeleteQueueService = async (queueId: number | string): Promise<void> => {
  const queue = await ShowQueueService(queueId);
  await UserQueue.destroy({ where: { queueId } });
  await queue.destroy();
};

export default DeleteQueueService;
