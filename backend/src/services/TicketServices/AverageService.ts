/* eslint-disable */
import { Op, Sequelize } from "sequelize";
import Ticket from "../../database/models/Ticket";
import User from "../../database/models/User";
import AppError from "../../errors/AppError";

interface UserData {
  id: number | string;
  name: string;
}
interface AverageTime {
  milliseconds: number;
  user: UserData;
  ticketIds: number[]
}

interface Response {
  averageTimes: AverageTime[];
  totalAverageTime: number;
}

const AverageService = async (
    searchParam: string = "",
    companyId: number,
): Promise<Response> => {
  const whereCondition = {
    "$User.name$": Sequelize.where(
      Sequelize.fn("LOWER", Sequelize.col("User.name")),
      "LIKE",
      `%${searchParam.toLowerCase().trim()}%`
    ),
    companyId
  };
    const users = await User.findAll({
      where: whereCondition,

  })

  let averageTimes = [];

  for (const user of users) {
    const tickets = await Ticket.findAll({
      where: {
        userId: user.id,
        companyId: companyId,
        status: "closed",
        finalizedAt: { [Op.ne]: null }
      }
    });

    const ticketIds = [];
    let totalMilliseconds = 0;

    for (const ticket of tickets) {
      const createdAt = new Date(ticket.createdAt);
      const finalizedAt = new Date (ticket.finalizedAt);
      totalMilliseconds += Math.abs(createdAt.getTime() - finalizedAt.getTime());

      ticketIds.push(ticket.id);
    }

    const averageMilliseconds = totalMilliseconds / ticketIds.length;

    if (ticketIds.length > 0) {
      const data = {
        totalMilliseconds,
        averageMilliseconds,
        user: {
          id: user.id,
          name: user.name
        },
        ticketIds
      }

      averageTimes.push(data);
    }
  }

  let totalTickets = 0;
  let totalMilliseconds = 0;

  for (const averageTime of averageTimes) {
    totalTickets += averageTime.ticketIds.length;
    totalMilliseconds += averageTime.totalMilliseconds;
  }

  const totalAverageTime = totalMilliseconds / totalTickets;

  if (averageTimes.length > 6) {
    averageTimes.sort((a, b) => { return b.averageMilliseconds - a.averageMilliseconds } );

    const start = averageTimes.slice(0, 3);
    const end = averageTimes.slice(-3);

    averageTimes = [...start, ...end];
  }

  return { averageTimes, totalAverageTime };
};

export default AverageService;