import Chip from "@material-ui/core/Chip";
import {
  differenceInHours,
  formatDistanceStrict,
  fromUnixTime,
} from "date-fns";
import { es } from "date-fns/locale";
import React, { useEffect, useState } from "react";

export default function TicketListItemLastMessageTime({ ticket }) {
  const [nowTime, setNowTime] = useState(new Date().getTime());

  useEffect(() => {
    let interval;

    interval = setInterval(() => {
      setNowTime((old) => old + 5000);
    }, 5000);

    return () => clearInterval(interval);
  }, [ticket]);

  return (
    <Chip
      style={{ height: "20px", fontSize: "11px" }}
      color={
        differenceInHours(
          nowTime,
          ticket.userHadContact
            ? fromUnixTime(
                ticket.firstClientMessageAfterLastUserMessage[0].timestamp
              )
            : new Date(ticket.createdAt)
        ) >= 24
          ? "secondary"
          : "default"
      }
      size="small"
      label={`Hace ${
        formatDistanceStrict(
          nowTime,
          ticket.userHadContact
            ? fromUnixTime(
                ticket.firstClientMessageAfterLastUserMessage[0].timestamp
              )
            : new Date(ticket.createdAt),
          {
            locale: es,
          }
        ) || "x"
      }`}
    />
  );
}
