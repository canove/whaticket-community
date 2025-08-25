import Distribution from "../../models/Distribution";
import userQueue from "../../models/UserQueue";
import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";

interface Request {
  queueId: number;
  ticket: Ticket;
}

const DistributeTicketService = async ({ queueId, ticket }: Request) => {
  const distribution = await Distribution.findOne({ where: { queueId, isActive: true } });

  if (!distribution) {
    throw new AppError("ERR_DISTRIBUTION_NOT_ACTIVE", 400);
  }

  const userIds = JSON.parse(String(distribution.users));
  let index = userIds.indexOf(distribution.currentUserId ?? -1);
  if (index === -1) {
    index = 0;
    distribution.currentUserId = userIds[0];
  }

  const selectedUser = userIds[index];
  if (!selectedUser) {
    throw new AppError("ERR_NO_USER_TO_ASSIGN_TICKET", 400);
  }

  await ticket.update({ userId: selectedUser });

  const nextIndex = (index + 1) % userIds.length;
  distribution.currentUserId = userIds[nextIndex];
  await distribution.save();

  return ticket;
};

export default DistributeTicketService;