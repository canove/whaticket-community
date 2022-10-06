import ShowQueueService from "./ShowQueueService";

const DeleteQueueService = async (
  queueId: number | string,
  companyId: number | string
): Promise<void> => {
  const queue = await ShowQueueService(queueId, companyId);

  await queue.destroy();
};

export default DeleteQueueService;
