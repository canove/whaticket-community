import socketIo, { Server as SocketIO } from "socket.io";
import { Server } from "http";
import AppError from "../errors/AppError";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = socketIo(httpServer);
  io.on("connection", socket => {
    console.log("Client Connected");
    socket.on("joinChatBox", ticketId => {
      console.log("A client joined a ticket channel");
      socket.join(ticketId);
    });

    socket.on("joinNotification", () => {
      console.log("A client joined notification channel");
      socket.join("notification");
    });

    socket.on("joinTickets", status => {
      console.log(`A client joined to ${status} tickets channel.`);
      socket.join(status);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
  return io;
};
export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};
