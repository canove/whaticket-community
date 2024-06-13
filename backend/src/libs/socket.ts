import { io, Socket } from "socket.io-client";
import AppError from "../errors/AppError";

let ioS: Socket;
let ioClient: Socket;

export const initIO = (): Socket => {
  // @ts-ignore
  ioS = io(process.env.NODE_URL); /* new SocketIO(httpServer, {
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
