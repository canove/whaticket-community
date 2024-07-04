import React, { useEffect, useReducer, useState } from "react";
import { useHistory } from "react-router-dom";

import { IconButton, makeStyles } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import InputAdornment from "@material-ui/core/InputAdornment";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";

import SearchIcon from "@material-ui/icons/Search";
import { format, fromUnixTime } from "date-fns";

import TableRowSkeleton from "../../components/TableRowSkeleton";
import api from "../../services/api";

import Tooltip from "@material-ui/core/Tooltip";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const reducer = (state, action) => {
  if (action.type === "LOAD_MESSAGES") {
    const messages = action.payload;
    const newMessages = [];

    messages.forEach((message) => {
      const messageIndex = state.findIndex((c) => c.id === message.id);
      if (messageIndex !== -1) {
        state[messageIndex] = message;
      } else {
        newMessages.push(message);
      }
    });

    return [...state, ...newMessages];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  noCollapseColumn: {
    minWidth: 160, // Ajusta este valor según tus necesidades
  },
  CollapseColumn: {
    wordBreak: "break-all",
  },
  highlight: {
    backgroundColor: "yellow",
    fontWeight: "bold",
  },
}));

const Messages = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [messages, dispatch] = useReducer(reducer, []);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/messages", {
            params: { searchParam, pageNumber },
          });
          console.log("MESSAGES PAGE DATA", data);
          dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const highlightText = (text, highlight) => {
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} className={classes.highlight}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <MainHeader>
        <Title>Mensajes</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Conversación</TableCell>
              <TableCell align="center" className={classes.CollapseColumn}>
                Mensaje
              </TableCell>
              <TableCell align="center">Emisor</TableCell>
              <TableCell align="center" className={classes.noCollapseColumn}>
                Fecha
              </TableCell>
              <TableCell align="center">Conexión</TableCell>
              <TableCell padding="checkbox" />
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell style={{ paddingRight: 0 }}>
                    {<Avatar src={message.ticket?.contact?.profilePicUrl} />}
                  </TableCell>
                  <TableCell>{message.ticket?.contact?.name}</TableCell>

                  <TableCell align="center" className={classes.CollapseColumn}>
                    {highlightText(message.body, searchParam.trim())}
                  </TableCell>
                  <TableCell align="center">
                    {message.contactId
                      ? message.contact?.name
                      : message.fromMe
                      ? "INTERNO"
                      : "-"}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={classes.noCollapseColumn}
                  >
                    {message.timestamp
                      ? format(fromUnixTime(message.timestamp), "dd-MM-yyyy")
                      : "---"}
                  </TableCell>
                  <TableCell align="center">
                    {message.ticket?.whatsapp?.name || "-"}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ir a la conversación">
                      <IconButton
                        size="small"
                        onClick={() => {
                          console.log({ message });
                          history.push(`/tickets/${message.ticketId}`);
                        }}
                      >
                        <WhatsAppIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton avatar columns={3} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Messages;
