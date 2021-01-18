import ShowQueueService from "./ShowQueueService";

const DeleteQueueService = async (queueId: number | string): Promise<void> => {
  const queue = await ShowQueueService(queueId);

  await queue.destroy();
};

export default DeleteQueueService;
