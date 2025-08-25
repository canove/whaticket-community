import userQueue from "../../models/UserQueue";
import Queue from "../../models/Queue";
import AppError from "../../errors/AppError";
import Distribution from "../../models/Distribution";

interface Request {
  queueId: number;
  enabled?: boolean;
}

const CreateOrUpdateDistributionService = async ({ queueId, enabled }: Request) => {
  const queue = await Queue.findByPk(queueId);
  if (!queue) {
    throw new AppError("ERR_NO_QUEUE_FOUND", 404);
  }

  let distribution = await Distribution.findOne({ where: { queueId } });
  const users = await userQueue.findAll({ where: { queueId } });
  const userIds = users.map(user => user.userId);
  if (!distribution) {
    distribution = await Distribution.create({
      queueId,
      users: userIds,
      currentUserId: userIds[0] || null,
      isActive: enabled !== undefined ? enabled : false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } else {
    distribution.users = userIds;
    if (
      distribution.currentUserId === null ||
      !userIds.includes(distribution.currentUserId)
    ) {
      distribution.currentUserId = userIds[0] || null;
    }
    if (enabled !== undefined) {
      distribution.isActive = enabled;
    }
    await distribution.save();
  }
  return distribution;
};

export default CreateOrUpdateDistributionService;