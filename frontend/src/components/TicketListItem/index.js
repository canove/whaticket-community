import React, { useState, useEffect, useRef, useContext } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import makeStyles from '@mui/styles/makeStyles';
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { Tooltip } from "@mui/material";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

const avatarColors = [
  "#E8F5E9", "#E3F2FD", "#FFF3E0", "#FCE4EC",
  "#F3E5F5", "#E0F7FA", "#FFF8E1", "#EFEBE9",
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const getAvatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const hexToRgba = (hex, alpha) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const useStyles = makeStyles(() => ({
  ticket: {
    position: "relative",
    padding: "11px 14px 11px 18px",
    borderBottom: "1px solid #F5F5F4",
    alignItems: "flex-start",
    transition: "background-color 150ms ease",
    "&:hover": {
      backgroundColor: "rgba(37,211,102,0.04)",
    },
    "&.Mui-selected": {
      backgroundColor: "rgba(37,211,102,0.08)",
      "&::before": {
        content: '""',
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: "#25D366",
        borderRadius: "0 2px 2px 0",
      },
      "&:hover": {
        backgroundColor: "rgba(37,211,102,0.10)",
      },
    },
  },

  pendingTicket: {
    cursor: "unset",
  },

  queueBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: "0 2px 2px 0",
  },

  avatarWrapper: {
    position: "relative",
    marginRight: 12,
    minWidth: 0,
    paddingTop: 2,
  },

  avatar: {
    width: 42,
    height: 42,
    fontSize: 15,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 700,
    border: "1px solid #E7E5E4",
  },

  unreadBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#25D366",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 700,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
    boxSizing: "border-box",
    border: "1.5px solid #ffffff",
  },

  content: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },

  row1: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },

  contactName: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 13.5,
    color: "#1C1917",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
    minWidth: 0,
  },

  contactNameUnread: {
    fontWeight: 700,
    color: "#0A0F1E",
  },

  timeLabel: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 11.5,
    color: "#78716C",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  timeLabelUnread: {
    color: "#25D366",
    fontWeight: 600,
  },

  lastMessage: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12.5,
    color: "#78716C",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.4,
  },

  lastMessageUnread: {
    color: "#44403C",
    fontWeight: 600,
  },

  unreadCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#25D366",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 700,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 5px",
    boxSizing: "border-box",
    flexShrink: 0,
    marginLeft: 6,
  },

  row3: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
    marginTop: 2,
  },

  queuePill: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 10,
    padding: "2px 8px",
    fontSize: 10.5,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: "0.2px",
  },

  connectionPill: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 10,
    padding: "2px 8px",
    fontSize: 10.5,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: "0.2px",
    color: "#1DAB57",
    backgroundColor: "rgba(37,211,102,0.10)",
  },

  acceptButton: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    borderRadius: 9,
    backgroundColor: "#25D366",
    color: "#ffffff",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 12,
    textTransform: "none",
    height: 30,
    padding: "0 14px",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#1DAB57",
      boxShadow: "0 2px 8px rgba(37,211,102,0.25)",
    },
  },
}));

const TicketListItem = ({ ticket }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    navigate(`/tickets/${id}`);
  };

  const handleSelectTicket = (id) => {
    navigate(`/tickets/${id}`);
  };

  const contactName = ticket.contact?.name || "";
  const queueColor = ticket.queue?.color || "#78716C";
  const hasPhoto = !!ticket.contact?.profilePicUrl;
  const hasUnread = ticket.unreadMessages > 0;

  const timeLabel = ticket.lastMessage
    ? isSameDay(parseISO(ticket.updatedAt), new Date())
      ? format(parseISO(ticket.updatedAt), "HH:mm")
      : format(parseISO(ticket.updatedAt), "dd/MM/yy")
    : null;

  return (
    <ListItem
      dense
      button
      onClick={() => {
        if (ticket.status === "pending") return;
        handleSelectTicket(ticket.id);
      }}
      selected={ticketId && +ticketId === ticket.id}
      className={clsx(classes.ticket, {
        [classes.pendingTicket]: ticket.status === "pending",
      })}
      disableGutters
    >
      {/* Queue color bar — only when not selected (selected has its own green bar) */}
      {!(ticketId && +ticketId === ticket.id) && (
        <Tooltip arrow placement="right" title={ticket.queue?.name || "Sem fila"}>
          <span
            className={classes.queueBar}
            style={{ backgroundColor: queueColor }}
          />
        </Tooltip>
      )}

      {/* Avatar */}
      <ListItemAvatar className={classes.avatarWrapper}>
        <>
          <Avatar
            src={hasPhoto ? ticket.contact.profilePicUrl : undefined}
            className={classes.avatar}
            style={
              !hasPhoto
                ? {
                    backgroundColor: getAvatarColor(contactName),
                    color: "#1C1917",
                  }
                : {}
            }
          >
            {!hasPhoto && getInitials(contactName)}
          </Avatar>
          {ticket.unreadMessages > 0 && (
            <span className={classes.unreadBadge}>{ticket.unreadMessages}</span>
          )}
        </>
      </ListItemAvatar>

      {/* Content */}
      <ListItemText
        disableTypography
        primary={
          <div className={classes.content}>
            {/* Row 1: name + time + unread count */}
            <div className={classes.row1}>
              <span className={clsx(classes.contactName, { [classes.contactNameUnread]: hasUnread })}>
                {contactName}
              </span>
              <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                {timeLabel && (
                  <span className={clsx(classes.timeLabel, { [classes.timeLabelUnread]: hasUnread })}>
                    {timeLabel}
                  </span>
                )}
                {hasUnread && (
                  <span className={classes.unreadCount}>
                    {ticket.unreadMessages > 99 ? "99+" : ticket.unreadMessages}
                  </span>
                )}
              </span>
            </div>

            {/* Row 2: last message */}
            <Typography
              className={clsx(classes.lastMessage, { [classes.lastMessageUnread]: hasUnread })}
              component="span"
            >
              {ticket.lastMessage ? (
                <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
              ) : (
                <span style={{ opacity: 0.4 }}>—</span>
              )}
            </Typography>

            {/* Row 3: queue + connection pills */}
            {(ticket.queue?.name || ticket.whatsapp?.name) && (
              <div className={classes.row3}>
                {ticket.queue?.name && (
                  <span
                    className={classes.queuePill}
                    style={{
                      color: queueColor,
                      backgroundColor: hexToRgba(queueColor, 0.12),
                    }}
                  >
                    {ticket.queue.name}
                  </span>
                )}
                {ticket.whatsappId && ticket.whatsapp?.name && (
                  <Tooltip title={i18n.t("ticketsList.connectionTitle")} arrow>
                    <span className={classes.connectionPill}>
                      {ticket.whatsapp.name}
                    </span>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        }
      />

      {ticket.status === "pending" && (
        <ButtonWithSpinner
          variant="contained"
          className={classes.acceptButton}
          size="small"
          loading={loading}
          onClick={() => handleAcepptTicket(ticket.id)}
        >
          {i18n.t("ticketsList.buttons.accept")}
        </ButtonWithSpinner>
      )}
    </ListItem>
  );
};

export default TicketListItem;
