import { useState, useEffect, useReducer, useContext } from "react";
import openSocket from "../../services/socket-io";

import List from "@mui/material/List";
import Paper from "@mui/material/Paper";

import TicketListItem from "../TicketListItem";
import TicketsListSkeleton from "../TicketsListSkeleton";

import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { styled } from "@mui/material/styles";

const TicketsListWrapperStyled = styled(Paper)({
  position: "relative",
  display: "flex",
  height: "100%",
  flexDirection: "column",
  overflow: "hidden",
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
});

const TicketsListStyled = styled(Paper)({
  flex: 1,
  overflowY: "scroll",
  //@ts-ignore
  // ...theme.scrollbarStyles,
  borderTop: "2px solid rgba(0, 0, 0, 0.12)",
});
const ticketsListHeaderStyled = styled(Paper)({
  color: "rgb(67, 83, 105)",
  zIndex: 2,
  backgroundColor: "white",
  borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});
const ticketsCountStyled = styled(Paper)({
  fontWeight: "normal",
  color: "rgb(104, 121, 146)",
  marginLeft: "8px",
  fontSize: "14px",
});
const NoTicketsTextStyled = styled("p")({ textAlign: "center", color: "rgb(104, 121, 146)", fontSize: "14px", lineHeight: "1.4" });
const NoTicketsTitleStyled = styled("span")({ textAlign: "center", fontSize: "16px", fontWeight: 600, margin: "0px" });
const NoTicketsDivStyled = styled("div")({
  display: "flex",
  height: "100px",
  margin: 40,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});


interface Ticket {
  id: number;
  userId?: number;
  queueId?: number;
  unreadMessages: number;
  contactId: number;
  contact: Contact;
  status: string;
  updatedAt: string;
}

interface Contact {
  id: number;
  name: string;
  profilePicUrl: string;
}

interface Action {
  type: string;
  payload?: any;
}

const reducer = (state: Ticket[], action: Action): Ticket[] => {
  if (action.type === "LOAD_TICKETS") {
    const newTickets: Ticket[] = action.payload;

    newTickets.forEach((ticket) => {
      const ticketIndex = state.findIndex((t) => t.id === ticket.id);
      if (ticketIndex !== -1) {
        state[ticketIndex] = ticket;
        if (ticket.unreadMessages > 0) {
          state.unshift(state.splice(ticketIndex, 1)[0]);
        }
      } else {
        state.push(ticket);
      }
    });

    return [...state];
  }

  if (action.type === "RESET_UNREAD") {
    const ticketId: number = action.payload;

    const ticketIndex = state.findIndex((t) => t.id === ticketId);
    if (ticketIndex !== -1) {
      state[ticketIndex].unreadMessages = 0;
    }

    return [...state];
  }

  if (action.type === "UPDATE_TICKET") {
    const ticket: Ticket = action.payload;

    const ticketIndex = state.findIndex((t) => t.id === ticket.id);
    if (ticketIndex !== -1) {
      state[ticketIndex] = ticket;
    } else {
      state.unshift(ticket);
    }

    return [...state];
  }

  if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
    const ticket: Ticket = action.payload;

    const ticketIndex = state.findIndex((t) => t.id === ticket.id);
    if (ticketIndex !== -1) {
      state[ticketIndex] = ticket;
      state.unshift(state.splice(ticketIndex, 1)[0]);
    } else {
      state.unshift(ticket);
    }

    return [...state];
  }

  if (action.type === "UPDATE_TICKET_CONTACT") {
    const contact: Contact = action.payload;
    const ticketIndex = state.findIndex((t) => t.contactId === contact.id);
    if (ticketIndex !== -1) {
      state[ticketIndex].contact = contact;
    }
    return [...state];
  }

  if (action.type === "DELETE_TICKET") {
    const ticketId: number = action.payload;
    const ticketIndex = state.findIndex((t) => t.id === ticketId);
    if (ticketIndex !== -1) {
      state.splice(ticketIndex, 1);
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  return state;
};

interface TicketsListProps {
  status?: string;
  searchParam?: string;
  showAll?: boolean;
  selectedQueueIds: number[];
  updateCount?: (count: number) => void;
  style?: React.CSSProperties;
}

const TicketsList = (props: TicketsListProps) => {
  const { status, searchParam, showAll, selectedQueueIds, updateCount, style } = props;
  const [pageNumber, setPageNumber] = useState(1);
  const [ticketsList, dispatch] = useReducer(reducer, []);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [status, searchParam, dispatch, showAll, selectedQueueIds]);

  const { tickets, hasMore, loading } = useTickets({
    pageNumber,
    searchParam,
    status,
    showAll,
    queueIds: selectedQueueIds,
    date: "",
    withUnreadMessages: "false",
  });

  useEffect(() => {
    if (!status && !searchParam) return;
    dispatch({
      type: "LOAD_TICKETS",
      payload: tickets,
    });
  }, [tickets]);

  useEffect(() => {
    const socket = openSocket();

    const shouldUpdateTicket = (ticket: Ticket) =>
      !searchParam &&
      (!ticket.userId || ticket.userId === user?.id || showAll) &&
      (!ticket.queueId || selectedQueueIds.indexOf(ticket.queueId) > -1);

    const notBelongsToUserQueues = (ticket: Ticket) => ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1;

    socket.on("connect", () => {
      if (status) {
        socket.emit("joinTickets", status);
      } else {
        socket.emit("joinNotification");
      }
    });

    socket.on("ticket", (data) => {
      if (data.action === "updateUnread") {
        dispatch({
          type: "RESET_UNREAD",
          payload: data.ticketId,
        });
      }

      if (data.action === "update" && shouldUpdateTicket(data.ticket)) {
        dispatch({
          type: "UPDATE_TICKET",
          payload: data.ticket,
        });
      }

      if (data.action === "update" && notBelongsToUserQueues(data.ticket)) {
        dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
      }
    });

    socket.on("appMessage", (data) => {
      if (data.action === "create" && shouldUpdateTicket(data.ticket)) {
        dispatch({
          type: "UPDATE_TICKET_UNREAD_MESSAGES",
          payload: data.ticket,
        });
      }
    });

    socket.on("contact", (data) => {
      if (data.action === "update") {
        dispatch({
          type: "UPDATE_TICKET_CONTACT",
          payload: data.contact,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [status, searchParam, showAll, user, selectedQueueIds]);

  useEffect(() => {
    if (typeof updateCount === "function") {
      updateCount(ticketsList.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketsList]);

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      e.currentTarget.scrollTop = scrollTop - 100;
      loadMore();
    }
  };

  return (
    <TicketsListWrapperStyled style={style}>
      <TicketsListStyled square elevation={0} onScroll={handleScroll}>
        <List style={{ paddingTop: 0 }}>
          {ticketsList.length === 0 && !loading ? (
            <NoTicketsDivStyled>
              <NoTicketsTitleStyled>{i18n.t("ticketsList.noTicketsTitle")}</NoTicketsTitleStyled>
              <NoTicketsTextStyled>{i18n.t("ticketsList.noTicketsMessage")}</NoTicketsTextStyled>
            </NoTicketsDivStyled>
          ) : (
            <>
              {ticketsList.map((ticket) => (
                <TicketListItem ticket={ticket} key={ticket.id} />
              ))}
            </>
          )}
          {loading && <TicketsListSkeleton />}
        </List>
      </TicketsListStyled>
    </TicketsListWrapperStyled>
  );
};

export default TicketsList;
