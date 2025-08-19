import React, { useState, useRef, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import CloseIcon from "@material-ui/icons/Close";
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
  messageBubble: {
    maxWidth: "80%",
    padding: "8px 12px",
    borderRadius: 16,
    marginBottom: 8,
    background: "#f5f5f5",
    boxShadow: "0 1px 2px rgba(0,0,0,0.07)",
    wordBreak: "break-word",
    alignSelf: "flex-start",
  },
  messageBubbleMe: {
    background: "#DCF8C6",
    alignSelf: "flex-end",
  },
  messageMeta: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    textAlign: "right",
  },
  drawerPaper: {
    width: 320,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxSizing: "border-box",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    borderRight: "1px solid rgba(0, 0, 0, 0.12)",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: "#eee",
  },
  header: {
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    backgroundColor: "#eee",
    padding: theme.spacing(0, 1),
    minHeight: "73px",
    justifyContent: "flex-start",
    boxSizing: "border-box",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    padding: "8px 8px 8px 8px",
    gap: 8,
    backgroundColor: "#eee",
    ...theme.scrollbarStyles,
  },
  searchField: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  resultsList: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",  
    borderRadius: 8,
    border: "1px solid #eee",
    background: "#fff",
  },
  contactName: {
    fontWeight: "bold",
    marginBottom: 2,
  }
}));

const TicketSearchButton = ({ ticketId, onOpen, onClose, open, onScrollToMessage }) => {
  const classes = useStyles();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState("");
  const timer = useRef(null);

  const fetchMessages = async (page, reset = false, searchValue = query) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/messages/search/${ticketId}`, {
        params: { searchText: searchValue, pageNumber: page }
      });
      if (reset) {
        setMessages(data.Messages);
      } else {
        setMessages(prev => [...prev, ...data.Messages]);
      }
      setHasMore(data.Messages.length >= 40);
      setPageNumber(page);
    } catch {
      setMessages([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (value.length >= 1) {
        fetchMessages(1, true, value);
      } else {
        setMessages([]);
        setHasMore(false);
        setPageNumber(1);
      }
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleOpen = () => {
    onOpen();
  };

  const handleClose = () => {
    setQuery("");
    setMessages([]);
    setPageNumber(1);
    setHasMore(false);
    onClose();
  };

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const threshold = 100;
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) <= threshold;

    if (isNearBottom && hasMore && !loading) {
      const next = pageNumber + 1;
      fetchMessages(next);
    }
  };

  return (
    <>
      <IconButton
        aria-label="Buscar mensagem"
        onClick={handleOpen}
        className={classes.searchBtn}
      >
        <SearchIcon />
      </IconButton>

      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open={open}
        classes={{ paper: classes.drawerPaper }}
        PaperProps={{ style: { position: "absolute" } }}
        ModalProps={{
          container: document.getElementById("drawer-container"),
          style: { position: "absolute" },
        }}
      >
        <div className={classes.header}>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography style={{ marginLeft: 8 }}>
            Buscar Mensagens
          </Typography>
        </div>

        <div className={classes.content}>
          <TextField
            autoFocus
            fullWidth
            label="Digite para buscar"
            value={query}
            onChange={handleChange}
            variant="outlined"
            className={classes.searchField}
          />

          {loading && messages.length === 0 && (
            <CircularProgress size={24} style={{ margin: 16 }} />
          )}

          <div
            className={classes.resultsList}
            onScroll={handleScroll}
          >
            <List>
              {!loading && messages.length === 0 && query.length >= 1 && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  style={{ textAlign: "center", marginTop: 32 }}
                >
                  Nenhuma mensagem encontrada.
                </Typography>
              )}

              {messages.map(msg => (
                <ListItem
                  button
                  key={msg.id}
                  style={{ display: "flex", flexDirection: "column", alignItems: msg.fromMe ? "flex-end" : "flex-start", background: "transparent", border: "none" }}
                  onClick={() => {
                    handleClose();
                    onScrollToMessage(msg.id);
                  }}
                >
                  <div
                    className={
                      msg.fromMe
                        ? `${classes.messageBubble} ${classes.messageBubbleMe}`
                        : classes.messageBubble
                    }
                  >
                    <Typography variant="body2" className={classes.contactName}>
                      {msg.contact && msg.contact.name ? msg.contact.name : "Eu"}
                    </Typography>
                    {msg.mediaType === "image" && msg.mediaUrl && (
                      <img src={msg.mediaUrl} alt="img" style={{ maxWidth: 60, maxHeight: 60, borderRadius: 8, marginBottom: 4 }} />
                    )}
                    <Typography variant="body2">{msg.body}</Typography>
                    <div className={classes.messageMeta}>
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                </ListItem>
              ))}

              {loading && messages.length > 0 && (
                <ListItem>
                  <Typography variant="body2" color="textSecondary">
                    Carregando...
                  </Typography>
                </ListItem>
              )}
            </List>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default TicketSearchButton;
