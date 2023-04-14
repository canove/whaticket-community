import { Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";

const SessionTimer = ({ ticket }) => {
    const [time, setTime] = useState(0);

    useEffect(() => {
        let interval = null;  
        if (ticket.whatsapp && ticket.whatsapp.official) {
            const now = new Date();
            now.setDate(now.getDate() - 1);
        
            const createdAt = new Date(ticket.createdAt);
        
            const time = createdAt.getTime() - now.getTime();
        
            if (time > 0) {
                setTime(time);
        
                interval = setInterval(() => {
                setTime((time) => time - 10);
                }, 10);
            } else {
                setTime(0);
                clearInterval(interval);
            }
        }
    
        return () => {
            clearInterval(interval);
        };
    }, [ticket]);

    const formatTime = (milliseconds) => {
        let seconds = milliseconds / 1000;
      
        let minutes = Math.floor(seconds / 60);
        seconds = Math.floor((seconds / 60 - minutes) * 60);
      
        let hours = Math.floor(minutes / 60);
        minutes = Math.floor((minutes / 60 - hours) * 60);
      
        let secondsString = seconds.toString();
        let minutesString = minutes.toString();
        let hoursString = hours.toString();
      
        if (secondsString.length === 1) {
          secondsString = `0${secondsString}`;
        }
      
        if (minutesString.length === 1) {
          minutesString = `0${minutesString}`;
        }
      
        if (hoursString.length === 1) {
          hoursString = `0${hoursString}`;
        }
      
        if (hoursString === "NaN" || minutesString === "NaN" || secondsString === "NaN") return "00:00:00";
      
        return `${hoursString}:${minutesString}:${secondsString}`;
    };

    return (
        <div style={{ backgroundColor: "#eee", padding: "16px" }}>
            <Typography>Tempo da sessão: {formatTime(time)}</Typography>
        </div>
    );
}

export default SessionTimer;
