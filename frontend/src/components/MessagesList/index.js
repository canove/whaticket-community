import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import clsx from "clsx";
import { format, fromUnixTime, isSameDay, parseISO } from "date-fns";
import openSocket from "../../services/socket-io";

import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import {
  AccessTime,
  Block,
  Done,
  DoneAll,
  ExpandMore,
  GetApp,
} from "@material-ui/icons";

import TextsmsOutlinedIcon from "@material-ui/icons/TextsmsOutlined";
import whatsBackground from "../../assets/wa-background.png";
import { SearchMessageContext } from "../../context/SearchMessage/SearchMessageContext";
import useWhatsApps from "../../hooks/useWhatsApps";
import LocationPreview from "../LocationPreview";
import MarkdownWrapper from "../MarkdownWrapper";
import MessageOptionsMenu from "../MessageOptionsMenu";
import ModalImageCors from "../ModalImageCors";
import VcardPreview from "../VcardPreview";

import toastError from "../../errors/toastError";
import api from "../../services/api";
import Audio from "../Audio";

const useStyles = makeStyles((theme) => ({
  messagesListWrapper: {
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },

  messagesList: {
    backgroundImage: `url(${whatsBackground})`,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: "20px 20px 20px 20px",
    overflowY: "scroll",
    [theme.breakpoints.down("sm")]: {
      paddingBottom: "90px",
    },
    ...theme.scrollbarStyles,
  },

  circleLoading: {
    color: green[500],
    position: "absolute",
    opacity: "70%",
    top: 0,
    left: "50%",
    marginTop: 12,
  },

  messageLeft: {
    marginRight: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },

    whiteSpace: "pre-wrap",
    backgroundColor: "#ffffff",
    color: "#303030",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: "0 1px 1px #b3b3b3",
  },

  quotedContainerLeft: {
    margin: "-3px -80px 6px -6px",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  quotedContainerLeftFromOtherConnection: {
    margin: "-3px -80px 6px -6px",
    overflow: "hidden",
    backgroundColor: "#daeced",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  quotedMsg: {
    padding: 10,
    maxWidth: 300,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },

  quotedSideColorLeft: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },

  messageRight: {
    marginLeft: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },

    whiteSpace: "pre-wrap",
    backgroundColor: "#dcf8c6",
    color: "#303030",
    alignSelf: "flex-end",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: "0 1px 1px #b3b3b3",
  },

  messageLeftFromOtherConnection: {
    marginRight: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },

    whiteSpace: "pre-wrap",
    backgroundColor: "#ebfeff",
    color: "#303030",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: "0 1px 1px #b3b3b3",
  },

  privateMessageRight: {
    marginLeft: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },

    whiteSpace: "pre-wrap",
    backgroundColor: "#FFFFD4",
    color: "#303030",
    alignSelf: "flex-end",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: "0 1px 1px #b3b3b3",
  },

  quotedContainerRight: {
    margin: "-3px -80px 6px -6px",
    overflowY: "hidden",
    backgroundColor: "#cfe9ba",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  quotedMsgRight: {
    padding: 10,
    maxWidth: 300,
    height: "auto",
    whiteSpace: "pre-wrap",
  },

  quotedSideColorRight: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },

  messageActionsButton: {
    display: "none",
    position: "relative",
    color: "#999",
    zIndex: 1,
    backgroundColor: "inherit",
    opacity: "90%",
    "&:hover, &.Mui-focusVisible": { backgroundColor: "inherit" },
  },

  messageContactName: {
    display: "flex",
    alignItems: "center",
    color: "#6bcbef",
    fontWeight: 500,
  },

  textContentItem: {
    overflowWrap: "break-word",
    padding: "3px 80px 6px 6px",
  },

  textContentItemDeleted: {
    fontStyle: "italic",
    color: "rgba(0, 0, 0, 0.36)",
    overflowWrap: "break-word",
    padding: "3px 80px 6px 6px",
  },

  messageMedia: {
    objectFit: "cover",
    width: 250,
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  timestamp: {
    fontSize: 11,
    position: "absolute",
    bottom: 0,
    right: 5,
    color: "#999",
  },

  dailyTimestamp: {
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    width: "110px",
    backgroundColor: "#e1f3fb",
    margin: "10px",
    borderRadius: "10px",
    boxShadow: "0 1px 1px #b3b3b3",
  },

  ticketDivider: {
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    width: "100%",
    backgroundColor: "#4a4a4a",
    fontSize: 18,
    color: "white",
    margin: "30px 0px 30px",
    paddingTop: "5px",
    paddingBottom: "5px",
    borderRadius: "10px",
    boxShadow: "0 1px 1px #b3b3b3",
  },

  dailyTimestampText: {
    color: "#808888",
    padding: 8,
    alignSelf: "center",
    marginLeft: "0px",
  },

  ackIcons: {
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  deletedIcon: {
    fontSize: 18,
    verticalAlign: "middle",
    marginRight: 4,
  },

  ackDoneAllIcon: {
    color: green[500],
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  downloadMedia: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "inherit",
    padding: 10,
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_MESSAGES" || action.type === "LOAD_NEW_MESSAGES") {
    // console.log(action.type);
    const messages = action.payload;
    const newMessages = [];

    messages.forEach((message) => {
      const messageIndex = state.findIndex((m) => m.id === message.id);
      if (messageIndex !== -1) {
        state[messageIndex] = message;
      } else {
        newMessages.push(message);
      }
    });

    if (action.type === "LOAD_MESSAGES") {
      return [...newMessages, ...state];
    } else if (action.type === "LOAD_NEW_MESSAGES") {
      return [...state, ...newMessages];
    }
  }

  if (action.type === "ADD_MESSAGE") {
    const newMessage = action.payload;
    const messageIndex = state.findIndex((m) => m.id === newMessage.id);

    if (messageIndex !== -1) {
      state[messageIndex] = newMessage;
    } else {
      state.push(newMessage);
    }

    return [...state];
  }

  if (action.type === "UPDATE_MESSAGE") {
    const messageToUpdate = action.payload;
    const messageIndex = state.findIndex((m) => m.id === messageToUpdate.id);

    if (messageIndex !== -1) {
      state[messageIndex] = messageToUpdate;
    } else {
      state.push(messageToUpdate);
    }

    return [...state];
  }

  if (action.type === "UPDATE_CONTACT") {
    const updatedContact = action.payload;

    const newState = state.map((message) => {
      if (message.contact?.id === updatedContact.id) {
        return {
          ...message,
          contact: updatedContact,
        };
      }
      return message;
    });

    return [...newState];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const MessagesList = ({ ticketId, isGroup, isAPreview }) => {
  const classes = useStyles();

  const [messagesList, dispatch] = useReducer(reducer, []);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastMessageRef = useRef();

  const [selectedMessage, setSelectedMessage] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const messageOptionsMenuOpen = Boolean(anchorEl);
  const currentTicketId = useRef(ticketId);
  const { loadingWhatsapps, whatsApps } = useWhatsApps();
  const [ticketsQueue, setTicketsQueue] = useState([]);
  const [nextTicketsQueue, setNextTicketsQueue] = useState([]);
  const [foundMessageId, setFoundMessageId] = useState(null);
  const foundMessageRef = useRef();
  const { searchingMessageId, setSearchingMessageId } =
    useContext(SearchMessageContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setTicketsQueue([
      {
        ticketId,
        pageNumber: 1,
      },
    ]);

    currentTicketId.current = ticketId;
  }, [ticketId]);

  const fetchMessages = async ({
    evenToDispatch = "LOAD_MESSAGES",
    wantScrollToBottom = true,
    ticketId,
    ticketsQueue,
  }) => {
    try {
      if (ticketsQueue) {
        console.log("________fetchMessages START ticketsQueue:", ticketsQueue);

        const { data } = await api.get("/messagesV2", {
          params: {
            setTicketMessagesAsRead: !isAPreview,
            ticketsToFetchMessagesQueue: JSON.stringify(ticketsQueue),
            ...(searchingMessageId && { searchMessageId: searchingMessageId }),
          },
        });

        console.log("________fetchMessages data", data);

        setNextTicketsQueue(data.nextTicketsToFetchMessagesQueue);

        if (currentTicketId.current === ticketId) {
          dispatch({
            type: evenToDispatch,
            payload: data.messages,
          });
          setHasMore(data.hasMore);
          setLoading(false);
        }

        if (ticketsQueue[0].pageNumber === 1 && data.messages.length > 1) {
          if (wantScrollToBottom) {
            console.log("________fetchMessages wantScrollToBottom");
            scrollToBottom();
          }
        }

        if (searchingMessageId) {
          console.log(
            "________fetchMessages setFoundMessageId with searchingMessageId:",
            searchingMessageId
          );
          setFoundMessageId(searchingMessageId);
          setSearchingMessageId(null);
        }
      }
    } catch (err) {
      console.log("_____________err: ", err);
      setLoading(false);
      toastError(err);
    }
  };

  useEffect(() => {
    setLoading(true);

    const delayDebounceFn = setTimeout(() => {
      console.log("fetching messages in setTimeout");
      fetchMessages({
        ticketId,
        ticketsQueue,
      });
    }, 500);

    // const intervalFn = setInterval(() => {
    //   console.log("fetching messages in setInterval");
    //   fetchMessages({
    //     ticketId,
    //     ticketsQueue,
    //     evenToDispatch: "LOAD_NEW_MESSAGES",
    //     wantScrollToBottom: false,
    //   });
    // }, 5000);

    return () => {
      clearTimeout(delayDebounceFn);
      // clearInterval(intervalFn);
    };
  }, [ticketId, ticketsQueue]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("connect", () => {
      console.log("socket conectado");
      socket.emit("joinChatBox", ticketId);
    });

    socket.on("appMessage", (data) => {
      console.log("appMessage", data);
      if (data.action === "create") {
        dispatch({ type: "ADD_MESSAGE", payload: data.message });
        scrollToBottom();
      }

      if (data.action === "update") {
        dispatch({ type: "UPDATE_MESSAGE", payload: data.message });
      }
    });

    socket.on("contact", (data) => {
      if (data.action === "update") {
        console.log("UPDATE_CONTACT", data);
        dispatch({ type: "UPDATE_CONTACT", payload: data.contact });
      }
    });

    return () => {
      console.log("socket desconectado");
      socket.disconnect();
    };
  }, [ticketId]);

  useEffect(() => {
    if (searchingMessageId) {
      if (messagesList.find((m) => m.id === searchingMessageId)) {
        console.log(
          "---- searchingMessageId alredy in messagesList!: ",
          searchingMessageId
        );
        if (searchingMessageId && searchingMessageId === foundMessageId) {
          scrollToFoundMessage();
        } else {
          setFoundMessageId(searchingMessageId);
        }
        setSearchingMessageId(null);
      } else {
        loadMore();
      }
    }
  }, [searchingMessageId]);

  useEffect(() => {
    // console.log("____ foundMessageId cambió: " + foundMessageId);
    if (foundMessageId) {
      scrollToFoundMessage();
    }
  }, [foundMessageId]);

  useEffect(() => {
    console.log("whatsApps", whatsApps);
  }, [whatsApps]);

  const loadMore = () => {
    setTicketsQueue(() => {
      const next = JSON.parse(JSON.stringify(nextTicketsQueue));
      next[next.length - 1].pageNumber = +next[next.length - 1].pageNumber + 1;
      console.log("---- loadMore setTicketsQueue", next);
      return next;
    });
  };

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      console.log("---- scrollIntoView");
      lastMessageRef.current.scrollIntoView({});
    }
  };

  const scrollToFoundMessage = () => {
    if (foundMessageRef.current) {
      console.log("---- scrollToFoundMessage foundMessageId", foundMessageId);
      foundMessageRef.current.scrollIntoView({});
    }
  };

  const handleScroll = (e) => {
    if (!hasMore) return;
    const { scrollTop } = e.currentTarget;

    if (scrollTop === 0) {
      document.getElementById("messagesList").scrollTop = 1;
    }

    if (loading) {
      return;
    }

    if (scrollTop < 50) {
      loadMore();
    }
  };

  const handleOpenMessageOptionsMenu = (e, message) => {
    setAnchorEl(e.currentTarget);
    setSelectedMessage(message);
  };

  const handleCloseMessageOptionsMenu = (e) => {
    setAnchorEl(null);
  };

  const checkMessageMedia = (message) => {
    if (
      message.mediaType === "location" &&
      message.body.split("|").length >= 2
    ) {
      let locationParts = message.body.split("|");
      let imageLocation = locationParts[0];
      let linkLocation = locationParts[1];

      let descriptionLocation = null;

      if (locationParts.length > 2)
        descriptionLocation = message.body.split("|")[2];

      return (
        <LocationPreview
          image={imageLocation}
          link={linkLocation}
          description={descriptionLocation}
        />
      );
    } else if (message.mediaType === "vcard") {
      //console.log("vcard")
      //console.log(message)
      let array = message.body.split("\n");
      let obj = [];
      let contact = "";
      for (let index = 0; index < array.length; index++) {
        const v = array[index];
        let values = v.split(":");
        for (let ind = 0; ind < values.length; ind++) {
          if (values[ind].indexOf("+") !== -1) {
            obj.push({ number: values[ind] });
          }
          if (values[ind].indexOf("FN") !== -1) {
            contact = values[ind + 1];
          }
        }
      }
      return <VcardPreview contact={contact} numbers={obj[0]?.number} />;
    } else if (
      /*else if (message.mediaType === "multi_vcard") {
      console.log("multi_vcard")
      console.log(message)
    	
      if(message.body !== null && message.body !== "") {
        let newBody = JSON.parse(message.body)
        return (
          <>
            {
            newBody.map(v => (
              <VcardPreview contact={v.name} numbers={v.number} />
            ))
            }
          </>
        )
      } else return (<></>)
    }*/
      /^.*\.(jpe?g|png|gif)?$/i.exec(message.mediaUrl) &&
      message.mediaType === "image"
    ) {
      return <ModalImageCors imageUrl={message.mediaUrl} />;
    } else if (message.mediaType === "audio") {
      return <Audio url={message.mediaUrl} />;
    } else if (message.mediaType === "video") {
      return (
        <video
          className={classes.messageMedia}
          src={message.mediaUrl}
          controls
        />
      );
    } else {
      return (
        <>
          <div className={classes.downloadMedia}>
            <Button
              startIcon={<GetApp />}
              color="primary"
              variant="outlined"
              target="_blank"
              href={message.mediaUrl}
            >
              Download
            </Button>
          </div>
          <Divider />
        </>
      );
    }
  };

  const renderMessageAck = (message) => {
    if (message.ack === 0) {
      return <AccessTime fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 1) {
      return <Done fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 2) {
      return <DoneAll fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 3 || message.ack === 4) {
      return <DoneAll fontSize="small" className={classes.ackDoneAllIcon} />;
    }
  };

  const renderTicketDividers = (message, index) => {
    if (index === 0 && !hasMore) {
      return (
        <div
          className={classes.ticketDivider}
          key={`timestamp-${message.ticketId}`}
        >
          Ticket: {message.ticketId}
        </div>
      );
    }

    if (index > 0 && index <= messagesList.length - 1) {
      let previousMessage = messagesList[index - 1];
      if (message?.ticketId !== previousMessage?.ticketId) {
        return (
          <div
            className={classes.ticketDivider}
            key={`timestamp-${message.ticketId}`}
          >
            Ticket: {message.ticketId}
          </div>
        );
      }
    }
  };

  const renderDailyTimestamps = (message, index) => {
    if (index === 0) {
      return (
        <span
          className={classes.dailyTimestamp}
          key={`timestamp-${message.id}`}
        >
          <div className={classes.dailyTimestampText}>
            {format(
              messagesList[index].timestamp
                ? fromUnixTime(messagesList[index].timestamp)
                : parseISO(messagesList[index].createdAt),
              "dd/MM/yyyy"
            )}
          </div>
        </span>
      );
    }
    if (index <= messagesList.length - 1) {
      let messageDay = messagesList[index].timestamp
        ? fromUnixTime(messagesList[index].timestamp)
        : parseISO(messagesList[index].createdAt);

      let previousMessageDay = messagesList[index - 1].timestamp
        ? fromUnixTime(messagesList[index - 1].timestamp)
        : parseISO(messagesList[index - 1].createdAt);

      if (!isSameDay(messageDay, previousMessageDay)) {
        return (
          <span
            className={classes.dailyTimestamp}
            key={`timestamp-${message.id}`}
          >
            <div className={classes.dailyTimestampText}>
              {format(
                messagesList[index].timestamp
                  ? fromUnixTime(messagesList[index].timestamp)
                  : parseISO(messagesList[index].createdAt),
                "dd/MM/yyyy"
              )}
            </div>
          </span>
        );
      }
    }
  };

  const renderMessageDivider = (message, index) => {
    if (index < messagesList.length && index > 0) {
      let messageUser = messagesList[index].fromMe;
      let previousMessageUser = messagesList[index - 1].fromMe;

      if (messageUser !== previousMessageUser) {
        return (
          <span style={{ marginTop: 16 }} key={`divider-${message.id}`}></span>
        );
      }
    }
  };

  const renderQuotedMessage = (message) => {
    return (
      <div
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          console.log("Quoted message clicked:", message);
          setSearchingMessageId(message.quotedMsg?.id);
        }}
        className={clsx(classes.quotedContainerLeft, {
          [classes.quotedContainerRight]:
            message.fromMe ||
            (isGroup &&
              !message.fromMe &&
              (whatsApps.find((w) => w.number === message.contact?.number) ||
                message.contact?.isCompanyMember)),
        })}
      >
        <span
          className={clsx(classes.quotedSideColorLeft, {
            [classes.quotedSideColorRight]: message.quotedMsg?.fromMe,
          })}
        ></span>
        <div className={classes.quotedMsg}>
          <span className={classes.messageContactName}>
            {message.quotedMsg?.fromMe ? (
              <>Tú</>
            ) : (
              <>
                {message.quotedMsg?.contact?.name}
                <div style={{ fontSize: 11, color: "#999", marginRight: 30 }}>
                  {" "}
                  +{message.quotedMsg?.contact?.number}
                </div>
              </>
            )}
          </span>
          {message.quotedMsg?.body}
        </div>
      </div>
    );
  };

  const renderLastMessageMark = (message, index) => {
    return (
      <>
        {index === messagesList.length - 1 && (
          <div
            key={`ref-${message.timestamp || message.createdAt}`}
            ref={lastMessageRef}
            style={{ float: "left", clear: "both" }}
          />
        )}
      </>
    );
  };

  const renderFoundMessageMark = (message) => {
    return (
      <>
        {message.id === foundMessageId && (
          <>
            <div
              key={`ref-${message.timestamp || message.createdAt}-${
                message.id
              }`}
              ref={foundMessageRef}
              style={{ float: "left", clear: "both", scrollMargin: "4rem" }}
            />
            <span
              style={{
                background: "black",
                alignSelf:
                  message.fromMe ||
                  (isGroup &&
                    (whatsApps?.find(
                      (w) => w.number === message?.contact?.number
                    ) ||
                      message?.contact?.isCompanyMember))
                    ? "flex-end"
                    : "flex-start",
                padding: "1px 8px",
                borderRadius: "100px",
                fontSize: "11px",
                marginBottom: "3px",
                marginTop: "10px",
                color: "white",
              }}
            >
              Mensaje buscado
            </span>
          </>
        )}
      </>
    );
  };

  const renderMessages = () => {
    if (messagesList.length > 0) {
      const viewMessagesList = messagesList.map((message, index) => {
        if (!message.fromMe) {
          return (
            <React.Fragment key={message.id}>
              {renderMessageDivider(message, index)}
              {renderTicketDividers(message, index)}
              {renderDailyTimestamps(message, index)}
              {renderLastMessageMark(message, index)}
              {renderFoundMessageMark(message)}
              <div
                className={
                  isGroup &&
                  (whatsApps.find(
                    (w) => w.number === message.contact?.number
                  ) ||
                    message.contact?.isCompanyMember)
                    ? classes.messageRight
                    : classes.messageLeft
                }
              >
                <IconButton
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  className={classes.messageActionsButton}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMore />
                </IconButton>
                {isGroup && (
                  <div className={classes.messageContactName}>
                    {message.contact?.name}{" "}
                    <div
                      style={{ fontSize: 11, color: "#999", marginRight: 30 }}
                    >
                      {" "}
                      +{message.contact?.number}
                    </div>
                  </div>
                )}
                {(message.mediaUrl ||
                  message.mediaType === "location" ||
                  message.mediaType === "vcard") &&
                  //|| message.mediaType === "multi_vcard"
                  checkMessageMedia(message)}
                <div className={classes.textContentItem}>
                  {message.quotedMsg && renderQuotedMessage(message)}
                  <MarkdownWrapper>{message.body}</MarkdownWrapper>
                  <span className={classes.timestamp}>
                    {format(
                      messagesList[index].timestamp
                        ? fromUnixTime(messagesList[index].timestamp)
                        : parseISO(messagesList[index].createdAt),
                      "HH:mm"
                    )}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment key={message.id}>
              {renderMessageDivider(message, index)}
              {renderTicketDividers(message, index)}
              {renderDailyTimestamps(message, index)}
              {renderLastMessageMark(message, index)}
              {renderFoundMessageMark(message)}
              <div
                className={
                  message.isPrivate
                    ? classes.privateMessageRight
                    : classes.messageRight
                }
              >
                <IconButton
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  className={classes.messageActionsButton}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMore />
                </IconButton>
                {(message.mediaUrl ||
                  message.mediaType === "location" ||
                  message.mediaType === "vcard") &&
                  //|| message.mediaType === "multi_vcard"
                  checkMessageMedia(message)}
                <div
                  className={clsx(classes.textContentItem, {
                    [classes.textContentItemDeleted]: message.isDeleted,
                  })}
                >
                  {message.isDeleted && (
                    <Block
                      color="disabled"
                      fontSize="small"
                      className={classes.deletedIcon}
                    />
                  )}
                  {message.quotedMsg && renderQuotedMessage(message)}
                  <MarkdownWrapper>{message.body}</MarkdownWrapper>
                  <span className={classes.timestamp}>
                    {format(
                      messagesList[index].timestamp
                        ? fromUnixTime(messagesList[index].timestamp)
                        : parseISO(messagesList[index].createdAt),
                      "HH:mm"
                    )}
                    {message.isPrivate ? (
                      <TextsmsOutlinedIcon
                        fontSize="small"
                        className={classes.ackIcons}
                      />
                    ) : (
                      renderMessageAck(message)
                    )}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        }
      });
      return viewMessagesList;
    } else {
      return <div>Say hello to your new contact!</div>;
    }
  };

  return (
    <div className={classes.messagesListWrapper}>
      <MessageOptionsMenu
        message={selectedMessage}
        anchorEl={anchorEl}
        menuOpen={messageOptionsMenuOpen}
        handleClose={handleCloseMessageOptionsMenu}
        canChangeTheIsCompanyMemberFromTheContact={
          isGroup &&
          !selectedMessage.fromMe &&
          !whatsApps.find((w) => w.number === selectedMessage.contact?.number)
        }
      />
      <div
        id="messagesList"
        className={classes.messagesList}
        onScroll={handleScroll}
      >
        {messagesList.length > 0 && (!isGroup || !loadingWhatsapps)
          ? renderMessages()
          : []}
      </div>
      {loading && (
        <div>
          <CircularProgress className={classes.circleLoading} />
        </div>
      )}
    </div>
  );
};

export default MessagesList;
