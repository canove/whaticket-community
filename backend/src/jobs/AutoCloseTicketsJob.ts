import { Op } from "sequelize";
import { subHours } from "date-fns";
import Ticket from "../models/Ticket";
import { getIO } from "../libs/socket";
import { logger } from "../utils/logger";
import { getRedisClient } from "../libs/redisStore";
import { invalidateTicketListCache } from "../services/TicketServices/ListTicketsService";

const WINDOW_HOURS = 24;
const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const BATCH_SIZE = 50; // process at most 50 tickets per run to avoid memory spikes
// Lock TTL slightly shorter than interval so it always expires before the next run
const LOCK_TTL_SECONDS = Math.floor((INTERVAL_MS - 10_000) / 1000);

export const startAutoCloseJob = (): void => {
  setInterval(async () => {
    const redis = getRedisClient();

    if (redis) {
      const acquired = await redis
        .set("auto-close-tickets:lock", "1", "EX", LOCK_TTL_SECONDS, "NX")
        .catch(() => null);
      if (acquired !== "OK") return; // another instance is handling this cycle
    }

    try {
      const cutoff = subHours(new Date(), WINDOW_HOURS);
      const io = getIO();
      let closedCount = 0;

      // Paginate in batches so we never load thousands of tickets at once
      while (true) {
        const tickets = await Ticket.findAll({
          where: {
            status: { [Op.in]: ["open", "pending"] },
            updatedAt: { [Op.lt]: cutoff }
          },
          limit: BATCH_SIZE,
          attributes: ["id", "status", "userId"]
        });

        if (tickets.length === 0) break;

        for (const ticket of tickets) {
          await ticket.update({ status: "closed" });
          io.to(ticket.id.toString()).emit("ticket", {
            action: "update",
            ticket
          });
        }

        closedCount += tickets.length;

        // If we got fewer than the batch size, we're done
        if (tickets.length < BATCH_SIZE) break;
      }

      if (closedCount > 0) {
        await invalidateTicketListCache().catch(() => {});
        logger.info(
          `AutoCloseJob: fechou ${closedCount} ticket(s) por inatividade de ${WINDOW_HOURS}h`
        );
      }
    } catch (err) {
      logger.error({ err }, "AutoCloseJob: erro ao fechar tickets automáticos");
    }
  }, INTERVAL_MS);

  logger.info(
    `AutoCloseJob: iniciado (janela ${WINDOW_HOURS}h, intervalo ${INTERVAL_MS / 1000}s)`
  );
};
