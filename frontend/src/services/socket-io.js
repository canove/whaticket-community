import openSocket from "socket.io-client";
import { getBackendUrl } from "../config";

function connectToSocket() {
    return openSocket(getBackendUrl());
}

export default connectToSocket;