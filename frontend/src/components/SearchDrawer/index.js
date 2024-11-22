import React, { useState, useEffect, useRef } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Drawer from "@material-ui/core/Drawer";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";

const drawerWidth = 360;
const mobileDrawerWidth = "100%";

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f9f9f9",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    borderRight: "1px solid rgba(0, 0, 0, 0.12)",
    [theme.breakpoints.down("sm")]: {
      width: mobileDrawerWidth,
    },
  },
  header: {
    display: "flex",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    backgroundColor: "#fff",
    alignItems: "center",
    padding: theme.spacing(1, 2),
    justifyContent: "space-between",
  },
  searchField: {
    margin: theme.spacing(2),
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: theme.spacing(2),
    ...theme.scrollbarStyles,
  },
  resultsList: {
    marginTop: theme.spacing(2),
  },
  messageItem: {
    padding: "12px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    marginBottom: theme.spacing(2),
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  },
  messageDate: {
    fontSize: "0.8rem",
    color: "#555",
    marginBottom: "5px",
  },
  messageBody: {
    fontSize: "1rem",
    color: "#333",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  noResults: {
    textAlign: "center",
    marginTop: theme.spacing(4),
    color: "#888",
  },
}));

const SearchDrawer = ({ open, handleDrawerClose, ticketId }) => {
  const classes = useStyles();

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchTimeout = useRef(null);
  const listRef = useRef();

  const fetchMessages = async (append = false) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/messages/${ticketId}/search`, {
        params: {
          term: searchTerm,
          offset: (page - 1) * 40,
          limit: 40,
        },
      });

      setResults((prev) => (append ? [...prev, ...data] : data));
      setHasMore(data.length === 40);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    clearTimeout(searchTimeout.current);
    const term = e.target.value;
    setSearchTerm(term);
    setPage(1);
    setHasMore(true);

    searchTimeout.current = setTimeout(() => {
      if (term.trim().length >= 3) fetchMessages(false);
    }, 1000);
  };

  const handleScroll = (e) => {
    if (
      e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 10 &&
      hasMore &&
      !loading
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    if (page > 1) fetchMessages(true);
  }, [page]);

  const handleClickMessage = (messageId) => {
    window.location.href = `/tickets/${ticketId}/messages/${messageId}`;
  };

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={open}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.header}>
        <Typography variant="h6">{i18n.t("searchDrawer.header")}</Typography>
        <IconButton onClick={handleDrawerClose}>
          <CloseIcon />
        </IconButton>
      </div>
      <div className={classes.content} onScroll={handleScroll} ref={listRef}>
        <TextField
          className={classes.searchField}
          variant="outlined"
          fullWidth
          value={searchTerm}
          placeholder={i18n.t("searchDrawer.placeholder")}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {loading && page === 1 && <CircularProgress style={{ margin: "16px auto" }} />}
        {results.length === 0 && !loading && (
          <Typography className={classes.noResults}>
            {i18n.t("searchDrawer.noResults")}
          </Typography>
        )}
        <List className={classes.resultsList}>
          {results.map((result) => (
            <ListItem
              key={result.id}
              className={classes.messageItem}
              onClick={() => handleClickMessage(result.id)}
            >
              <Typography className={classes.messageDate}>
                {new Date(result.createdAt).toLocaleString()}
              </Typography>
              <Typography className={classes.messageBody}>{result.body}</Typography>
            </ListItem>
          ))}
        </List>
        {loading && page > 1 && <CircularProgress style={{ margin: "16px auto" }} />}
        {!loading && !hasMore && results.length > 0 && (
          <Typography align="center" className={classes.noResults}>
            {i18n.t("searchDrawer.noMoreResults")}
          </Typography>
        )}
      </div>
    </Drawer>
  );
};

export default SearchDrawer;
