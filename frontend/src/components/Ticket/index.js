import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import clsx from "clsx";
import { toast } from "react-toastify";
import openSocket from "../../services/socket-io";

import { Paper, makeStyles } from "@material-ui/core";

import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { SearchMessageContext } from "../../context/SearchMessage/SearchMessageContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ContactDrawer from "../ContactDrawer";
import MessageInput from "../MessageInput/";
import MessagesList from "../MessagesList";
import TicketActionButtons from "../TicketActionButtons";
import TicketCategories from "../TicketCategories";
import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";

import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

const drawerWidth = 320;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },

  ticketInfo: {
    // maxWidth: "50%",
    // flexBasis: "50%",
    // [theme.breakpoints.down("sm")]: {
    //   maxWidth: "80%",
    //   flexBasis: "80%",
    // },
  },
  ticketActionButtons: {
    // maxWidth: "50%",
    // flexBasis: "50%",
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      // maxWidth: "100%",
      // flexBasis: "100%",
      marginBottom: "5px",
    },
  },

  mainWrapper: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeft: "0",
    marginRight: -drawerWidth,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },

  mainWrapperShift: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },
}));

const Ticket = () => {
  const { ticketId } = useParams();
  const history = useHistory();
  const classes = useStyles();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({});
  const [ticket, setTicket] = useState({});
  const [relatedTickets, setRelatedTickets] = useState([]);
  const [selectRelatedTicketId, setSelectRelatedTicketId] = useState(null);
  const { setSearchingMessageId } = useContext(SearchMessageContext);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTicket = async () => {
        try {
          const { data } = await api.get("/tickets/" + ticketId);

          setContact(data.contact);
          setTicket(data);

          // console.log("________ticket:", data);

          const { data: relatedTickets } = await api.get(
            "/showAllRelatedTickets/" + ticketId
          );

          console.log("________relatedTickets:", relatedTickets);

          setRelatedTickets(relatedTickets);
          setSelectRelatedTicketId(ticketId);

          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchTicket();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [ticketId, history]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("connect", () => socket.emit("joinChatBox", ticketId));

    socket.on("ticket", (data) => {
      if (data.action === "update") {
        setTicket(data.ticket);
        console.log("ticker actulizado", data.ticket);
      }

      if (data.action === "delete") {
        toast.success("Ticket deleted sucessfully.");
        history.push("/tickets");
      }
    });

    socket.on("contact", (data) => {
      if (data.action === "update") {
        setContact((prevState) => {
          if (prevState.id === data.contact?.id) {
            return { ...prevState, ...data.contact };
          }
          return prevState;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, history]);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <div className={classes.root} id="drawer-container">
      <Paper
        variant="outlined"
        elevation={0}
        className={clsx(classes.mainWrapper, {
          [classes.mainWrapperShift]: drawerOpen,
        })}
      >
        <TicketHeader withArrow={false} loading={loading}>
          <div className={classes.ticketInfo}>
            <TicketInfo
              contact={contact}
              ticket={ticket}
              onClick={handleDrawerOpen}
            />
          </div>

          <div>
            <FormControl fullWidth margin="dense" variant="outlined">
              <InputLabel>Ticket</InputLabel>
              <Select
                labelWidth={60}
                onChange={(e) => {
                  console.log(
                    e.target.value,
                    relatedTickets.find((rt) => rt.id === e.target.value)
                  );
                  setSelectRelatedTicketId(e.target.value);
                  setSearchingMessageId(
                    relatedTickets.find((rt) => rt.id === e.target.value)
                      ?.messages[0]?.id
                  );
                }}
                value={selectRelatedTicketId}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
              >
                {relatedTickets.map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    Ticket: {rt.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className={classes.ticketActionButtons}>
            <TicketActionButtons ticket={ticket} />
          </div>
        </TicketHeader>

        <TicketCategories ticket={ticket} />

        <ReplyMessageProvider>
          <MessagesList
            ticketId={ticketId}
            isGroup={ticket.isGroup}
          ></MessagesList>
          {ticket.status === "open" && (
            <MessageInput
              ticketIsGroup={ticket.isGroup}
              ticketStatus={ticket.status}
              ticketPrivateNote={ticket.privateNote}
            />
          )}
        </ReplyMessageProvider>
      </Paper>
      <ContactDrawer
        open={drawerOpen}
        handleDrawerClose={handleDrawerClose}
        contact={contact}
        ticketId={ticketId}
        loading={loading}
      />
    </div>
  );
};

export default Ticket;
