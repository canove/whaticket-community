import socketIo, { Server as SocketIO } from "socket.io";
import { Server } from "http";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = socketIo(httpServer);
  return io;
};
export const getIO = (): SocketIO => {
  if (!io) {
    throw new Error("Socket IO not initialized");
  }
  return io;
};
