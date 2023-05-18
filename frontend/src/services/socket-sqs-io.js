import openSocket from "socket.io-client";
import { getSQSUrl } from "../config";

function connectToSQSSocket() {
    return openSocket(getSQSUrl());
}

export default connectToSQSSocket;