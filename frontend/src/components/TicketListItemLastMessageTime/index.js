import Chip from "@material-ui/core/Chip";
import {
  differenceInHours,
  formatDistanceStrict,
  fromUnixTime,
} from "date-fns";
import { es } from "date-fns/locale";
import React, { useEffect, useState } from "react";

export default function TicketListItemLastMessageTime({ message }) {
  const [nowTime, setNowTime] = useState(new Date().getTime());

  useEffect(() => {
    let interval;

    interval = setInterval(() => {
      setNowTime((old) => old + 5000);
    }, 5000);

    return () => clearInterval(interval);
  }, [message]);

  return (
    <Chip
      style={{ height: "20px", fontSize: "11px" }}
      color={
        differenceInHours(
          nowTime,
          message.timestamp
            ? fromUnixTime(message.timestamp)
            : new Date(message.createdAt)
        ) >= 24
          ? "secondary"
          : "default"
      }
      size="small"
      label={`Hace ${
        formatDistanceStrict(
          nowTime,
          message.timestamp
            ? fromUnixTime(message.timestamp)
            : new Date(message.createdAt),
          {
            locale: es,
          }
        ) || "x"
      }`}
    />
  );
}
