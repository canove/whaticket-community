import { Server as SocketIO } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { Server } from "http";
import jwt from "jsonwebtoken";
const { verify } = jwt;
import AppError from "../errors/AppError.js";
import { logger } from "../utils/logger.js";
import authConfig from "../config/auth.js";

let io: SocketIO;

export const initIO = async (httpServer: Server): Promise<SocketIO> => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
    }
  });

  // Use Redis adapter when REDIS_URL is configured so that Socket.io events
  // are shared across all worker processes (PM2 cluster mode).
  if (process.env.REDIS_URL) {
    try {
      const pubClient = createClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();
      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      logger.info("Socket.io Redis adapter initialized (cluster-ready)");
    } catch (err) {
      logger.warn({
        info: "Socket.io Redis adapter failed, using in-memory adapter",
        err
      });
    }
  }

  io.on("connection", socket => {
    const rawToken = socket.handshake.query.token;
    const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
    let tokenData = null;
    try {
      if (!token) throw new Error("No token");
      tokenData = verify(token, authConfig.secret, { algorithms: ["HS256"] });
      logger.debug({ tokenData }, "io-onConnection: tokenData");
    } catch (error) {
      logger.error({ error }, "Error decoding token");
      socket.disconnect();
      return io;
    }

    logger.debug("Client Connected");
    socket.on("joinChatBox", (ticketId: string) => {
      logger.debug("A client joined a ticket channel");
      socket.join(ticketId);
    });

    socket.on("joinNotification", () => {
      logger.debug("A client joined notification channel");
      socket.join("notification");
    });

    socket.on("joinTickets", (status: string) => {
      logger.debug(`A client joined to ${status} tickets channel.`);
      socket.join(status);
    });

    socket.on("disconnect", () => {
      logger.debug("Client disconnected");
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
