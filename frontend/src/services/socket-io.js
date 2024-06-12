import openSocket from "socket.io-client";
import { getNodeUrl } from "../config";

function connectToSocket(userId) {
  const token = localStorage.getItem("token");
  return openSocket(getNodeUrl(), {
    transports: ["websocket", "polling", "flashsocket"],
    query: {
      token: JSON.parse(token),
      ...(userId && { userId }),
    },
  });
}

export default connectToSocket;
