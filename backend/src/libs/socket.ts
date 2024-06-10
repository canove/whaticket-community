import { Server } from "http";
import { verify } from "jsonwebtoken";
import { Server as SocketIO } from "socket.io";
import { io, Socket } from "socket.io-client";
import authConfig from "../config/auth";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import {
  addConnectedUser,
  getConnectedUsers,
  removeConnectedUser
} from "./connectedUsers";

let ioS: SocketIO;
let ioClient: Socket;

export const initIO = (httpServer: Server): SocketIO => {
  ioS = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
    }
  });
  ioClient = io("https://chat-app-tpev4hwxwa-uk.a.run.app");

  ioS.on("connection", socket => {
    const { token, userId } = socket.handshake.query;

    let tokenData = null;
    try {
      tokenData = verify(token, authConfig.secret);
      logger.debug(JSON.stringify(tokenData), "io-onConnection: tokenData");
    } catch (error) {
      logger.error(JSON.stringify(error), "Error decoding token");
      socket.disconnect();
      return ioS;
    }

    logger.info("Client Connected and added to the list of connected users");
    if (userId) {
      addConnectedUser(+userId);
      ioS.emit("usersPresenceList", getConnectedUsers());
    }

    socket.on("joinChatBox", (ticketId: string) => {
      logger.info("A client joined a ticket channel");
      socket.join(ticketId);
    });

    socket.on("joinNotification", () => {
      logger.info("A client joined notification channel");
      socket.join("notification");
    });

    socket.on("joinTickets", (status: string) => {
      logger.info(`A client joined to ${status} tickets channel.`);
      socket.join(status);
    });

    socket.on("disconnect", () => {
      logger.info(
        "Client disconnected and removed from the list of connected users"
      );
      if (userId) {
        removeConnectedUser(+userId);
        ioS.emit("usersPresenceList", getConnectedUsers());
      }
    });

    return socket;
  });
  return ioS;
};

export const getIO2 = (): SocketIO => {
  if (!ioS) {
    throw new AppError("Socket IO not initialized");
  }
  return ioS;
};

export const getIOClient = (): Socket => {
  if (!ioClient) {
    throw new AppError("Socket IO Client not initialized");
  }
  return ioClient;
};

export const getIO = (): Socket => {
  if (!ioClient) {
    throw new AppError("Socket IO Client not initialized");
  }
  return ioClient;
};
