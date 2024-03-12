import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import { JwtPayload, verify } from "jsonwebtoken";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import authConfig from "../config/auth";
import User from "../models/User";
import Queue from "../models/Queue";
import Ticket from "../models/Ticket";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
    }
  });

  io.on("connection", async socket => {
    const { token } = socket.handshake.query;
    let tokenData = null;
    try {
      tokenData = verify(token, authConfig.secret) as JwtPayload;
      logger.debug(JSON.stringify(tokenData), "io-onConnection: tokenData");
    } catch (error) {
      logger.error(JSON.stringify(error), "Error decoding token");
      socket.disconnect();
      return io;
    }

    const userId = tokenData.id;

    let user: User;
    if (userId && userId !== "undefined" && userId !== "null") {
      user = (await User.findByPk(userId, { include: [Queue] })) as User;
    }

    logger.info("Client Connected");
    socket.on("joinChatBox", (ticketId: string) => {
      if (ticketId === "undefined") {
        return;
      }
      Ticket.findByPk(ticketId).then(
        ticket => {
          // only admin and the current user of the ticket
          // can join the message channel of it.
          if (
            ticket &&
            (ticket.userId === user.id || user.profile === "admin")
          ) {
            logger.debug(`User ${user.id} joined ticket ${ticketId} channel`);
            socket.join(ticketId);
          } else {
            logger.info(
              `Invalid attempt to join chanel of ticket ${ticketId} by user ${user.id}`
            );
          }
        },
        error => {
          logger.error(error, `Error fetching ticket ${ticketId}`);
        }
      );
    });

    socket.on("joinNotification", () => {
      if (user.profile === "admin") {
        // admin can join all notifications
        logger.debug(`Admin ${user.id} joined the notification channel.`);
        socket.join("notification");
      } else {
        // normal users join notifications of the queues they participate
        user.queues.forEach(queue => {
          logger.debug(`User ${user.id} joined queue ${queue.id} channel.`);
          socket.join(`queue-${queue.id}-notification`);
        });
      }
    });

    socket.on("joinTickets", (status: string) => {
      if (user.profile === "admin") {
        // only admin can join the notifications of a particular status
        logger.debug(`Admin ${user.id} joined ${status} tickets channel.`);
        socket.join(`${status}`);
      } else {
        // normal users can only receive messages of the queues they participate
        user.queues.forEach(queue => {
          logger.debug(
            `User ${user.id} joined queue ${queue.id} ${status} tickets channel.`
          );
          socket.join(`queue-${queue.id}-${status}`);
        });
      }
    });

    socket.on("disconnect", () => {
      logger.info("Client disconnected");
    });

    socket.emit("ready");

    return socket;
  });
  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};
