import openSocket from "socket.io-client";
import { getWorkerUrl } from "../config";

function connectToWorkerSocket() {
    return openSocket(getWorkerUrl());
}

export default connectToWorkerSocket;