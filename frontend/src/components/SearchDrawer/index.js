import React, { useState, useEffect, useMemo, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import SearchIcon from "@material-ui/icons/Search";
import Drawer from "@material-ui/core/Drawer";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import CircularProgress from "@material-ui/core/CircularProgress";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import clsx from "clsx";

const drawerWidth = 320;

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    display: "flex",
    flexDirection: "column",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    borderRight: "1px solid rgba(0, 0, 0, 0.12)",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    [theme.breakpoints.down("sm")]: {
      width: drawerWidth,
    },
  },
  header: {
    display: "flex",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    padding: theme.spacing(1, 2),
    minHeight: "64px",
    justifyContent: "space-between",
  },
  searchContainer: {
    display: "flex",
    marginTop: theme.spacing(6),
    padding: theme.spacing(2),
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    backgroundColor: "#fafafa",
  },
  message: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
  },
  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  messageImage: {
    maxWidth: "100%",
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(1),
  },
  messageAudio: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
}));

const SearchDrawer = ({ open, handleDrawerClose, ticketId, onMessageClick }) => {
  const classes = useStyles();
  const [searchParam, setSearchParam] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchMessages = async (page = 1) => {
    try {
      setLoading(true);
      const searchParamNormalized = debouncedSearchTerm.toLocaleLowerCase();
      const { data } = await api.get(`/messages/${ticketId}/${searchParamNormalized}`, {
        params: { page }
      });
      
      console.log(data.messages);
      
      setDisplayedMessages((prevMessages) => [...prevMessages, ...data.messages]);
      setHasMore(data.messages.length === 40);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParam) {
      setDisplayedMessages([]);
      fetchMessages();
    }
  }, [searchParam, ticketId]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchParam);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchParam]);

  const handleScroll = (event) => {
    const bottom = event.target.scrollHeight - event.target.scrollTop === event.target.clientHeight;
    if (bottom && hasMore && !loading) {
      fetchMessages(pageNumber + 1);
      setPageNumber((prevPageNumber) => prevPageNumber + 1);
    }
  };

  const filteredMessages = useMemo(() => {
    const regex = new RegExp(debouncedSearchTerm, 'i');
    return displayedMessages.filter((message) => regex.test(message.body));
  }, [displayedMessages, debouncedSearchTerm]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) {
      return text;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    );
  };

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={open}
      classes={{
        paper: clsx(classes.drawerPaper, {
          [classes.drawerPaper]: open,
          [classes.drawerPaperHidden]: !open,
        }),
      }}
    >
      <div className={classes.searchContainer}>
        <IconButton onClick={handleDrawerClose}>
					<CloseIcon />
				</IconButton>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Digite para buscar..."
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </div>
      <List className={classes.content} onScroll={handleScroll}>
        {loading && pageNumber === 1 ? (
          <div className={classes.loadingContainer}>
            <CircularProgress />
          </div>
        ) : searchParam ? (
          filteredMessages.length > 0 ? (
            filteredMessages.map((message) => (
              <ListItem 
                key={message.id} 
                button 
                className={classes.message}
                onClick={() => {
                  onMessageClick(message.id, message);
                  setDebouncedSearchTerm("");
                }}
              >
                <ListItemText
                  primary={
                    <div className={classes.messageHeader}>
                      <Typography variant="subtitle2">
                        {message.fromMe ? "Você" : message.contact?.name || "Desconhecido"}
                      </Typography>
                      <Typography variant="caption">
                        {formatDate(message.createdAt)}
                      </Typography>
                    </div>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {highlightText(message.body, debouncedSearchTerm)}
                      </Typography>
                      {message.mediaUrl && (
                        message.mediaUrl.endsWith('.mpeg') ? (
                          <audio controls src={message.mediaUrl} className={classes.messageAudio} />
                        ) : (
                          <img
                            src={message.mediaUrl}
                            alt="Conteúdo de mídia"
                            className={classes.messageImage}
                          />
                        )
                      )}
                    </>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Typography>Nenhuma mensagem encontrada.</Typography>
          )
        ) : (
          <Typography>Digite algo para pesquisar mensagens.</Typography>
        )}
      </List>
    </Drawer>
  );
};

export default SearchDrawer;