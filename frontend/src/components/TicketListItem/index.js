import React, { useContext, useEffect, useRef, useState } from "react";

import clsx from "clsx";
import { format, fromUnixTime, isSameDay } from "date-fns";
import { useHistory, useParams } from "react-router-dom";

import toastError from "../../errors/toastError";
import api from "../../services/api";

import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Tooltip from "@material-ui/core/Tooltip";
import PeopleAltIcon from "@material-ui/icons/PeopleAlt";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import TicketPreviewModal from "../TicketPreviewModal";

import Typography from "@material-ui/core/Typography";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";

import IconButton from "@material-ui/core/IconButton";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import VisibilityOutlinedIcon from "@material-ui/icons/VisibilityOutlined";
import { AuthContext } from "../../context/Auth/AuthContext";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import TicketListItemLastMessageTime from "../TicketListItemLastMessageTime";

const useStyles = makeStyles((theme) => ({
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
    fontWeight: "600",
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
    maxWidth: "calc(100% - 100px)",
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

  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
    border: "none",
  },

  acceptButton: {
    flexShrink: 0,
    padding: 8,
    minWidth: "fit-content",
    marginLeft: 10,
    // position: "absolute",
    // left: "50%",
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

const TicketListItem = ({ ticket, openInANewWindowOnSelect = false }) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [previewModalIsOpen, setPreviewModalIsOpen] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const { whatsApps } = useContext(WhatsAppsContext);

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

      await api.post(`/privateMessages/${id}`, {
        body: `${user?.name} *aceptó* la conversación`,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    // history.push(`/tickets/${id}`);
  };

  const handleSelectTicket = (id) => {
    if (openInANewWindowOnSelect) {
      window.open(`/tickets/${id}`, "_blank");
    } else {
      history.push(`/tickets/${id}`);
    }
  };

  return (
    <React.Fragment key={ticket.id}>
      <ListItem
        dense
        button
        onClick={(e) => {
          // if (ticket.status === "pending") return;
          handleSelectTicket(ticket.id);
        }}
        selected={ticketId && +ticketId === ticket.id}
        className={clsx(classes.ticket, {
          [classes.pendingTicket]: ticket.status === "pending",
        })}
      >
        <Tooltip
          arrow
          placement="right"
          title={ticket.queue?.name || "Sin departamento"}
        >
          <span
            style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }}
            className={classes.ticketQueueColor}
          ></span>
        </Tooltip>
        <ListItemAvatar>
          <Avatar src={ticket?.contact?.profilePicUrl} />
        </ListItemAvatar>
        <ListItemText
          disableTypography
          primary={
            <span className={classes.contactNameWrapper}>
              {/* CONTACT NAME */}
              <Typography
                noWrap
                component="span"
                variant="body2"
                color="textPrimary"
              >
                {ticket.contact?.name}
              </Typography>
              {/* - CONTACT NAME */}

              <div style={{ display: "flex", gap: "4px" }}>
                {ticket.participantUsers?.find((hu) => hu.id === user?.id) && (
                  // HELP BADGE
                  // <Badge
                  //   className={classes.closedBadge}
                  //   badgeContent={"Apoyo"}
                  //   color="primary"
                  // />
                  <Chip
                    style={{ height: "20px", fontSize: "11px" }}
                    color="primary"
                    size="small"
                    label="Participando"
                  />
                  // HELP BADGE
                )}

                {/* // HELP BADGE */}
                {ticket.helpUsers?.length > 0 ? (
                  ticket.helpUsers?.find((hu) => hu.id === user?.id) ? (
                    <Chip
                      style={{ height: "20px", fontSize: "11px" }}
                      color="primary"
                      size="small"
                      label="Apoyando"
                    />
                  ) : (
                    <Chip
                      style={{ height: "20px", fontSize: "11px" }}
                      color="primary"
                      size="small"
                      label="Con apoyo"
                    />
                  )
                ) : null}

                {/* // TRANFER BADGE */}
                {ticket.transferred && (
                  <Chip
                    style={{ height: "20px", fontSize: "11px" }}
                    color="primary"
                    size="small"
                    label="Transferido"
                  />
                )}
                {/* // TRANFER BADGE */}

                {ticket.status === "closed" && (
                  // CLOSED BADGE
                  // <Badge
                  //   className={classes.closedBadge}
                  //   badgeContent={"Resuelto"}
                  //   color="primary"
                  // />
                  <Chip
                    style={{ height: "20px", fontSize: "11px" }}
                    color="primary"
                    size="small"
                    label="Resuelto"
                  />
                  // CLOSED BADGE
                )}

                {(() => {
                  if (!ticket.messages?.length > 0) {
                    return null;
                  }

                  let ticketMessages = ticket.messages;

                  const lastTicketMessage =
                    ticketMessages[ticketMessages.length - 1];

                  if (
                    whatsApps.find(
                      (w) => w.number === lastTicketMessage.contact?.number
                    ) ||
                    lastTicketMessage?.contact?.isCompanyMember ||
                    lastTicketMessage?.fromMe
                  ) {
                    return null;
                  }

                  let firstLastMessageThatIsFromTheClient;

                  for (let i = ticketMessages.length - 1; i >= 0; i--) {
                    if (
                      !whatsApps.find(
                        (w) => w.number === ticketMessages.contact?.number
                      ) &&
                      !ticketMessages[i]?.contact?.isCompanyMember &&
                      !ticketMessages[i]?.fromMe
                    ) {
                      firstLastMessageThatIsFromTheClient = ticketMessages[i];
                    } else {
                      break;
                    }
                  }

                  return (
                    <TicketListItemLastMessageTime
                      message={firstLastMessageThatIsFromTheClient}
                    />
                  );
                })()}

                {/* {(ticket.messages.length > 0 &&
                  ticket.firstClientMessageAfterLastUserMessage[0].timestamp) ||
                (ticket.firstClientMessageAfterLastUserMessage.length === 0 &&
                  !ticket.userHadContact) ? (
                  <TicketListItemLastMessageTime ticket={ticket} />
                ) : null} */}

                {ticket.lastMessageTimestamp && (
                  // LAST MESSAGE TIME
                  <Typography
                    className={classes.lastMessageTime}
                    component="span"
                    variant="body2"
                    color="textSecondary"
                  >
                    {isSameDay(
                      fromUnixTime(ticket.lastMessageTimestamp),
                      new Date()
                    ) ? (
                      <>
                        {format(
                          fromUnixTime(ticket.lastMessageTimestamp),
                          "HH:mm"
                        )}
                      </>
                    ) : (
                      <>
                        {format(
                          fromUnixTime(ticket.lastMessageTimestamp),
                          "dd/MM/yyyy"
                        )}
                      </>
                    )}
                  </Typography>
                  // - LAST MESSAGE TIME
                )}
              </div>

              {/* WPP */}
              {/* {ticket.whatsappId && (
                <SyncAltIcon />

                // <div
                //   className={classes.userTag}
                //   title={i18n.t("ticketsList.connectionTitle")}
                // >
                //   {ticket.whatsapp?.name}
                // </div>
              )} */}
              {/* WPP */}
            </span>
          }
          secondary={
            <>
              <span className={classes.contactNameWrapper}>
                {/* CATEGORY OR LAST MESSAGE */}
                <Typography
                  className={classes.contactLastMessage}
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
                </Typography>
                {/* - CATEGORY OR LAST MESSAGE */}

                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* USER */}
                  {ticket.isGroup && ticket.participantUsers.length > 0 && (
                    <Tooltip
                      title={`PARTICIPANDO: 
                            ${[...ticket.participantUsers]
                              .map((u) => u.name)
                              .join(" - ")}`}
                      aria-label="add"
                    >
                      <PeopleAltIcon fontSize="small" />
                    </Tooltip>
                  )}
                  {/* - USER */}

                  {/* USER */}
                  {!ticket.isGroup && ticket.userId && (
                    <Tooltip
                      title={`ASIGNADO: ${ticket.user?.name}${
                        ticket.helpUsers?.length > 0
                          ? ` | APOYO: ${ticket.helpUsers
                              .map((hu) => hu.name)
                              .join(" - ")}`
                          : ""
                      }`}
                      aria-label="add"
                    >
                      <PeopleAltIcon fontSize="small" />
                    </Tooltip>
                  )}
                  {/* - USER */}

                  {/* WPP */}
                  {ticket.whatsappId && (
                    <Tooltip
                      title={`CONEXIÓN: ${ticket.whatsapp?.name}`}
                      aria-label="add"
                    >
                      <WhatsAppIcon
                        style={{ color: "green" }}
                        fontSize="small"
                      />
                    </Tooltip>
                  )}
                  {/* WPP */}

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      setPreviewModalIsOpen(true);
                    }}
                  >
                    <VisibilityOutlinedIcon fontSize="medium" />
                  </IconButton>

                  <TicketPreviewModal
                    ticket={ticket}
                    open={previewModalIsOpen}
                    onClose={() => setPreviewModalIsOpen(false)}
                  />

                  {/* UNREAD MESSAGES */}
                  {ticket.unreadMessages > 0 && (
                    <Chip
                      label={ticket.unreadMessages}
                      size="small"
                      style={{ backgroundColor: green[500], color: "white" }}
                    />
                  )}
                  {/* - UNREAD MESSAGES */}
                </div>
              </span>

              {ticket.categories?.length > 0 && (
                <div style={{ display: "flex", justifyContent: "end" }}>
                  {ticket.categories.map((category) => (
                    <Chip
                      key={category.id}
                      style={{
                        backgroundColor: category.color,
                        height: "20px",
                        fontSize: "11px",
                      }}
                      variant="outlined"
                      label={category.name}
                      className={classes.chip}
                    />
                  ))}
                </div>
              )}
            </>
          }
        />
        {ticket.status === "pending" && (
          <Tooltip title="Aceptar Ticker" aria-label="Aceptar Ticker">
            <ButtonWithSpinner
              color="primary"
              variant="contained"
              className={classes.acceptButton}
              size="small"
              loading={loading}
              onClick={(e) => {
                e.stopPropagation();
                handleAcepptTicket(ticket.id);
              }}
            >
              <GroupAddIcon />
            </ButtonWithSpinner>
          </Tooltip>
        )}
      </ListItem>
      <Divider variant="inset" component="li" />
    </React.Fragment>
  );
};

export default TicketListItem;
