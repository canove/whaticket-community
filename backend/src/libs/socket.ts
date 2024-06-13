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

let ioS: Socket;
let ioClient: Socket;

export const initIO = (): Socket => {
  ioS = io("http://localhost:8081"); /* new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
    }
  }); */
  ioClient = ioS; // io("https://chat-app-tpev4hwxwa-uk.a.run.app");


  return ioS;
};

export const getIO = (): Socket => {
  if (!ioClient) {
    throw new AppError("Socket IO Client not initialized");
  }
  return ioClient;
};
