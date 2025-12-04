import React, { useState, useEffect, useReducer } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import Paper from "@material-ui/core/Paper";
import CircularProgress from "@material-ui/core/CircularProgress";
import { format, parseISO } from "date-fns";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import MarkdownWrapper from "../MarkdownWrapper";

const drawerWidth = 320;

const useStyles = makeStyles((theme) => ({
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
        display: "flex",
        borderTop: "1px solid rgba(0, 0, 0, 0.12)",
        borderRight: "1px solid rgba(0, 0, 0, 0.12)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    header: {
        display: "flex",
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        backgroundColor: "#eee",
        alignItems: "center",
        padding: theme.spacing(0, 1),
        minHeight: "73px",
        justifyContent: "flex-start",
    },
    searchContainer: {
        display: "flex",
        padding: theme.spacing(1),
        paddingTop: theme.spacing(2),
        alignItems: "center",
        justifyContent: "center",
    },
    searchInput: {
        flex: 1,
        border: "1px solid rgba(0, 0, 0, 0.12)",
        borderRadius: 4,
        padding: theme.spacing(1),
        backgroundColor: "#fff",
    },
    content: {
        display: "flex",
        backgroundColor: "#eee",
        flexDirection: "column",
        padding: "8px 0px 8px 8px",
        height: "100%",
        overflowY: "scroll",
        ...theme.scrollbarStyles,
    },
    messageItem: {
        padding: theme.spacing(1),
        margin: theme.spacing(1),
        cursor: "pointer",
        "&:hover": {
            backgroundColor: "#f5f5f5",
        },
    },
    timestamp: {
        fontSize: 11,
        color: "#999",
        marginTop: theme.spacing(1),
        textAlign: "right",
    },
    loading: {
        display: "flex",
        justifyContent: "center",
        padding: theme.spacing(2),
    },
}));

const reducer = (state, action) => {
    if (action.type === "LOAD_MESSAGES") {
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

        return [...state, ...newMessages];
    }

    if (action.type === "RESET") {
        return [];
    }
};

const MessageSearch = ({ open, handleDrawerClose, ticketId, handleJump }) => {
    const classes = useStyles();
    const [searchTerm, setSearchTerm] = useState("");
    const [messages, dispatch] = useReducer(reducer, []);
    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        if (!open) {
            setSearchTerm("");
            dispatch({ type: "RESET" });
            setPageNumber(1);
            setHasMore(false);
        }
    }, [open]);

    useEffect(() => {
        if (!searchTerm) {
            dispatch({ type: "RESET" });
            setPageNumber(1);
            setHasMore(false);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            const fetchMessages = async () => {
                if (pageNumber === 1) setLoading(true);
                try {
                    const { data } = await api.get("/messages/" + ticketId, {
                        params: { searchParam: searchTerm, pageNumber },
                    });
                    dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
                    setHasMore(data.hasMore);
                    setLoading(false);
                } catch (err) {
                    toastError(err);
                    setLoading(false);
                }
            };
            fetchMessages();
        }, 1000);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, ticketId, pageNumber]);

    const handleScroll = (e) => {
        if (!hasMore || loading) return;
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - (scrollTop + 100) < clientHeight) {
            setPageNumber((prev) => prev + 1);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPageNumber(1);
        dispatch({ type: "RESET" });
    };

    const onSelectMessage = (message) => {
        handleJump(message.id);
        handleDrawerClose();
    };

    return (
        <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="right"
            open={open}
            PaperProps={{ style: { position: "absolute" } }}
            BackdropProps={{ style: { position: "absolute" } }}
            ModalProps={{
                container: document.getElementById("drawer-container"),
                style: { position: "absolute" },
            }}
            classes={{
                paper: classes.drawerPaper,
            }}
        >
            <div className={classes.header}>
                <IconButton onClick={handleDrawerClose}>
                    <CloseIcon />
                </IconButton>
                <Typography style={{ justifySelf: "center" }}>
                    Search Messages
                </Typography>
            </div>
            <div className={classes.searchContainer}>
                <InputBase
                    className={classes.searchInput}
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    startAdornment={<SearchIcon style={{ marginRight: 8, color: "gray" }} />}
                />
            </div>
            <div className={classes.content} onScroll={handleScroll}>
                {messages.map((message) => (
                    <Paper
                        key={message.id}
                        className={classes.messageItem}
                        onClick={() => onSelectMessage(message)}
                    >
                        <MarkdownWrapper>{message.body}</MarkdownWrapper>
                        <div className={classes.timestamp}>
                            {format(parseISO(message.createdAt), "dd/MM/yyyy HH:mm")}
                        </div>
                    </Paper>
                ))}
                {loading && (
                    <div className={classes.loading}>
                        <CircularProgress />
                    </div>
                )}
            </div>
        </Drawer>
    );
};

export default MessageSearch;
