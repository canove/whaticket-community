import React from "react";
import { Avatar } from "@mui/material";
import { i18n } from "../../translate/i18n";

const TicketInfo = ({ contact, ticket, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 16px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <Avatar
        src={contact.profilePicUrl}
        alt={contact.name}
        style={{ width: 40, height: 40, flexShrink: 0 }}
      />
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 15,
            color: "#0A0F1E",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {contact.name}
          <span
            style={{
              marginLeft: 6,
              fontWeight: 400,
              color: "#9BA3B0",
              fontSize: 13,
            }}
          >
            #{ticket.id}
          </span>
        </p>
        {ticket.user && (
          <p
            style={{
              margin: 0,
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: 12,
              color: "#9BA3B0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {i18n.t("messagesList.header.assignedTo")} {ticket.user.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default TicketInfo;
