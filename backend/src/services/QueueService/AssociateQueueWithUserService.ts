import Queue from "../../models/Queue";

const AssociateQueueWithUserService = async (
  queue: Queue,
  userIds: number[]
): Promise<void> => {
  await queue.$set("users", userIds);

  await queue.reload();
};

export default AssociateQueueWithUserService;
