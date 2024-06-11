import openSocket from "socket.io-client";
import { getNodeUrl } from "../config";

function connectToSocket() {
    const token = localStorage.getItem("token");
    return openSocket(getNodeUrl(), {
      transports: ["websocket", "polling", "flashsocket"],
      query: {
        token: JSON.parse(token),
      },
    });
}

export default connectToSocket;