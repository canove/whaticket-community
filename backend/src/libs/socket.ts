import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import { verify } from "jsonwebtoken";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import AppError from "../errors/AppError.js";
import { logger } from "../utils/logger.js";
import authConfig from "../config/auth.js";
import User from "../models/User.js";

let io: SocketIO;

export const initIO = async (httpServer: Server): Promise<SocketIO> => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"]
  });

  const pubClient = createClient({ url: process.env.REDIS_URL || "redis://redis:6379" });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  io.adapter(createAdapter(pubClient, subClient));

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.query.token;
      let tokenData: any = null;
      if (token && typeof token === "string") {
        tokenData = verify(token, authConfig.secret);
        socket.handshake.auth = tokenData;
        const user = await User.findByPk(tokenData.id);
        if (user) {
          (socket as any).user = user;
          next();
        } else {
          next(new Error("Authentication error"));
        }
      } else {
        next(new Error("Authentication error"));
      }
    } catch (error) {
      logger.error(error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", socket => {
    const { companyId, id } = (socket as any).user;
    logger.info(`Client Connected: User ${id} Company ${companyId}`);

    socket.join(`company-${companyId}`);
    socket.join(`user-${id}`);

    socket.on("joinChatBox", (ticketId: string) => {
      logger.info(`A client joined a ticket channel: ${ticketId}`);
      socket.join(ticketId);
    });

    socket.on("joinNotification", () => {
      logger.info("A client joined notification channel");
      socket.join(`notification-${companyId}`);
    });

    socket.on("joinTickets", (status: string) => {
      logger.info(`A client joined to ${status} tickets channel.`);
      socket.join(`${status}-${companyId}`);
    });

    socket.on("disconnect", () => {
      logger.info("Client disconnected");
    });

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
