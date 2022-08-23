import { useEffect } from "react";
import openSocket from "../../services/socket-io";

const useSocket = (dispatch, socketEvent, typeUpdate, typeDelete, payloadUpdate, payloadDelete) => {
    useEffect(() => {
        const socket = openSocket();
    
        socket.on(socketEvent, (data) => {
          if (data.action === "update" || data.action === "create") {
            dispatch({ type: typeUpdate, payload: data[payloadUpdate] });
          }
    
          if (data.action === "delete") {
            dispatch({ type: typeDelete, payload: data[payloadDelete] });
          }
        });
    
        return () => {
          socket.disconnect();
        };
    }, []);
}

export default useSocket;