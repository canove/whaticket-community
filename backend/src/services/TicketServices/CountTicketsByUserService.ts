import { Op, fn, col, literal } from "sequelize";
import { startOfDay, endOfDay } from "date-fns";
import Ticket from "../../models/Ticket.js";
import User from "../../models/User.js";
import { getRedisClient } from "../../libs/redisStore.js";

interface UserTicketCount {
  userId: number;
  userName: string;
  open: number;
  closed: number;
  pending: number;
  total: number;
}

const CACHE_TTL = 60;

const CountTicketsByUserService = async (): Promise<UserTicketCount[]> => {
  const today = new Date();
  const dateKey = today.toISOString().slice(0, 10);

  const redis = getRedisClient();
  const cacheKey = `dashboard:ticket-counts:${dateKey}`;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  const results = await Ticket.findAll({
    where: {
      createdAt: {
        [Op.between]: [+startOfDay(today), +endOfDay(today)]
      },
      userId: { [Op.not]: null as any }
    },
    attributes: [
      "userId",
      [fn("COUNT", col("Ticket.id")), "total"],
      [
        fn("SUM", literal("CASE WHEN status = 'open' THEN 1 ELSE 0 END")),
        "open"
      ],
      [
        fn("SUM", literal("CASE WHEN status = 'closed' THEN 1 ELSE 0 END")),
        "closed"
      ],
      [
        fn("SUM", literal("CASE WHEN status = 'pending' THEN 1 ELSE 0 END")),
        "pending"
      ]
    ],
    include: [{ model: User, as: "user", attributes: ["id", "name"] }],
    group: ["userId", "user.id"],
    order: [[fn("COUNT", col("Ticket.id")), "DESC"]],
    raw: true,
    nest: true
  });

  const result = (results as any[]).map(r => ({
    userId: r.userId,
    userName: r.user?.name || "Sem nome",
    open: Number(r.open) || 0,
    closed: Number(r.closed) || 0,
    pending: Number(r.pending) || 0,
    total: Number(r.total) || 0
  }));

  if (redis) {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
  }

  return result;
};

export default CountTicketsByUserService;
