import socketIo, { Server as SocketIO } from "socket.io";
import { Server } from "http";
import AppError from "../errors/AppError";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = socketIo(httpServer);
  return io;
};
export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};
