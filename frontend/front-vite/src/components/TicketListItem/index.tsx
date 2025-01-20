import React, { useState, useEffect, useRef, useContext } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles } from "@mui/styles";
import { green } from "@mui/material/colors";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@mui/material";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import type { Error } from "../../types/Error";
import { styled } from "@mui/material/styles";

const TicketStyled = styled("div")({
  position: "relative",
});

const PendingTicketStyled = styled("div")({
  cursor: "unset",
});

const NoTicketsDivStyled = styled("div")({
  display: "flex",
  height: "100px",
  margin: 40,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

const NoTicketsTextStyled = styled("p")({
  textAlign: "center",
  color: "rgb(104, 121, 146)",
  fontSize: "14px",
  lineHeight: "1.4",
});

const NoTicketsTitleStyled = styled("h2")({
  textAlign: "center",
  fontSize: "16px",
  fontWeight: 600,
  margin: "0px",
});

const ContactNameWrapperStyled = styled("span")({
  display: "flex",
  justifyContent: "space-between",
});

const LastMessageTimeStyled = styled(Typography)({
  justifySelf: "flex-end",
});

const ClosedBadgeStyled = styled(Badge)({
  alignSelf: "center",
  justifySelf: "flex-end",
  marginRight: 32,
  marginLeft: "auto",
});

const ContactLastMessageStyled = styled(Typography)({
  paddingRight: 20,
});

const NewMessagesCountStyled = styled(Badge)({
  alignSelf: "center",
  marginRight: 8,
  marginLeft: "auto",
});

const BadgeStyleStyled = styled("div")({
  color: "white",
  backgroundColor: green[500],
});

const AcceptButtonStyled = styled(ButtonWithSpinner)({
  position: "absolute",
  left: "50%",
});

const TicketQueueColorStyled = styled("span")({
  flex: "none",
  width: "8px",
  height: "100%",
  position: "absolute",
  top: "0%",
  left: "0%",
});

const UserTagStyled = styled("div")({
  position: "absolute",
  marginRight: 5,
  right: 5,
  bottom: 5,
  background: "#2576D2",
  color: "#ffffff",
  border: "1px solid #CCC",
  padding: 1,
  paddingLeft: 5,
  paddingRight: 5,
  borderRadius: 10,
  fontSize: "0.9em",
});

const useStyles = makeStyles((_theme) => ({
  ticket: {
    position: "relative",
  },

  pendingTicket: {
    cursor: "unset",
  },

  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: 600,
    margin: "0px",
  },

  contactNameWrapper: {
    display: "flex",
    justifyContent: "space-between",
  },

  lastMessageTime: {
    justifySelf: "flex-end",
  },

  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 32,
    marginLeft: "auto",
  },

  contactLastMessage: {
    paddingRight: 20,
  },

  newMessagesCount: {
    alignSelf: "center",
    marginRight: 8,
    marginLeft: "auto",
  },

  badgeStyle: {
    color: "white",
    backgroundColor: green[500],
  },

  acceptButton: {
    position: "absolute",
    left: "50%",
  },

  ticketQueueColor: {
    flex: "none",
    width: "8px",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
  },

  userTag: {
    position: "absolute",
    marginRight: 5,
    right: 5,
    bottom: 5,
    background: "#2576D2",
    color: "#ffffff",
    border: "1px solid #CCC",
    padding: 1,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 10,
    fontSize: "0.9em",
  },
}));

interface Ticket {
  id: number;
  status: string;
  queue?: {
    name: string;
    color: string;
  };
  contact: {
    name: string;
    profilePicUrl: string;
  };
  updatedAt: string;
  lastMessage?: string;
  unreadMessages: number;
  whatsappId?: number;
  whatsapp?: {
    name: string;
  };
}

const TicketListItem = ({ ticket }: { ticket: Ticket }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleAcepptTicket = async (id: number) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });
    } catch (err) {
      setLoading(false);
      toastError(err as Error);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    navigate(`/tickets/${id}`);
  };

  const handleSelectTicket = (id: number) => {
    navigate(`/tickets/${id}`);
  };

  return (
    <React.Fragment key={ticket.id}>
      <ListItem
        dense
        button
        onClick={(e) => {
          if (ticket.status === "pending") return;
          handleSelectTicket(ticket.id);
        }}
        selected={!!ticketId && +ticketId === ticket.id}
        className={clsx(classes.ticket, {
          [classes.pendingTicket]: ticket.status === "pending",
        })}
      >
        <Tooltip
          arrow
          placement="right"
          title={ticket.queue?.name || "Sem fila"}
        >
          <TicketQueueColorStyled
            style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }}
          ></TicketQueueColorStyled>
        </Tooltip>
        <ListItemAvatar>
          <Avatar src={ticket?.contact?.profilePicUrl} />
        </ListItemAvatar>
        <ListItemText
          disableTypography
          primary={
            <ContactNameWrapperStyled>
              <Typography
                noWrap
                component="span"
                variant="body2"
                color="textPrimary"
              >
                {ticket.contact.name}
              </Typography>
              {ticket.status === "closed" && (
                <ClosedBadgeStyled
                  badgeContent={"closed"}
                  color="primary"
                />
              )}
              {ticket.lastMessage && (
                <LastMessageTimeStyled
                  component="span"
                  variant="body2"
                  color="textSecondary"
                >
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </LastMessageTimeStyled>
              )}
              {ticket.whatsappId && (
                <UserTagStyled
                  title={i18n.t("ticketsList.connectionTitle")}
                >
                  {ticket.whatsapp?.name}
                </UserTagStyled>
              )}
            </ContactNameWrapperStyled>
          }
          secondary={
            <ContactNameWrapperStyled>
              <ContactLastMessageStyled
                noWrap
                component="span"
                variant="body2"
                color="textSecondary"
              >
                {ticket.lastMessage ? (
                  <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
                ) : (
                  <br />
                )}
              </ContactLastMessageStyled>

              <NewMessagesCountStyled
                badgeContent={ticket.unreadMessages}
                classes={{
                  badge: classes.badgeStyle,
                }}
              />
            </ContactNameWrapperStyled>
          }
        />
        {ticket.status === "pending" && (
          <AcceptButtonStyled
            color="primary"
            variant="contained"
            size="small"
            loading={loading}
            onClick={(e) => handleAcepptTicket(ticket.id)}
          >
            {i18n.t("ticketsList.buttons.accept")}
          </AcceptButtonStyled>
        )}
      </ListItem>
      <Divider variant="inset" component="li" />
    </React.Fragment>
  );
};

export default TicketListItem;
