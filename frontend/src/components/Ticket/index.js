import React, { useState, useEffect, useRef, useReducer } from "react";
import { useParams, useHistory } from "react-router-dom";

import { toast } from "react-toastify";
import { isSameDay, parseISO, format } from "date-fns";
import openSocket from "socket.io-client";
import ModalImage from "react-modal-image";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import CircularProgress from "@material-ui/core/CircularProgress";
import DoneIcon from "@material-ui/icons/Done";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import Paper from "@material-ui/core/Paper";

import { IconButton } from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";

import api from "../../services/api";
import ContactDrawer from "../ContactDrawer";
import whatsBackground from "../../assets/wa-background.png";
import LinkifyWithTargetBlank from "../LinkifyWithTargetBlank";
import MessageInput from "../MessageInput/";
import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";
import TicketActionButtons from "../TicketActionButtons";

import MessageOptionsMenu from "../MessageOptionsMenu";

const drawerWidth = 320;

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		height: "100%",
		position: "relative",
		overflow: "hidden",
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

	messageActionsButton: {
		display: "none",
		position: "relative",
		color: "#999",
		zIndex: 1,
		backgroundColor: "#dcf8c6",
		"&:hover, &.Mui-focusVisible": { backgroundColor: "#dcf8c6" },
	},

	textContentItem: {
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

	ackDoneAllIcon: {
		color: green[500],
		fontSize: 18,
		verticalAlign: "middle",
		marginLeft: 4,
	},
}));

const reducer = (state, action) => {
	if (action.type === "LOAD_MESSAGES") {
		const messages = action.payload;
		const newMessages = [];

		messages.forEach(message => {
			const messageIndex = state.findIndex(m => m.id === message.id);
			if (messageIndex !== -1) {
				state[messageIndex] = message;
			} else {
				newMessages.push(message);
			}
		});

		return [...newMessages, ...state];
	}

	if (action.type === "ADD_MESSAGE") {
		const newMessage = action.payload;
		const messageIndex = state.findIndex(m => m.id === newMessage.id);

		if (messageIndex !== -1) {
			state[messageIndex] = newMessage;
		} else {
			state.push(newMessage);
		}

		return [...state];
	}

	if (action.type === "UPDATE_MESSAGE") {
		const messageToUpdate = action.payload;
		const messageIndex = state.findIndex(m => m.id === messageToUpdate.id);

		if (messageIndex !== -1) {
			state[messageIndex].ack = messageToUpdate.ack;
		}

		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const Ticket = () => {
	const { ticketId } = useParams();
	const history = useHistory();
	const classes = useStyles();

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [ticketLoading, setTicketLoading] = useState(true);
	const [contact, setContact] = useState({});
	const [ticket, setTicket] = useState({});

	const [messagesList, dispatch] = useReducer(reducer, []);
	const [hasMore, setHasMore] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);
	const lastMessageRef = useRef();

	const [selectedMessageId, setSelectedMessageId] = useState(null);
	const [anchorEl, setAnchorEl] = useState(null);
	const messageOptionsMenuOpen = Boolean(anchorEl);

	useEffect(() => {
		dispatch({ type: "RESET" });
		setPageNumber(1);
		setTicketLoading(true);
	}, [ticketId]);

	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchMessages = async () => {
				try {
					const { data } = await api.get("/messages/" + ticketId, {
						params: { pageNumber },
					});

					setContact(data.ticket.contact);
					setTicket(data.ticket);
					dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
					setHasMore(data.hasMore);
					setLoading(false);
					setTicketLoading(false);

					if (pageNumber === 1 && data.messages.length > 1) {
						scrollToBottom();
					}
				} catch (err) {
					console.log(err);
					if (err.response && err.response.data && err.response.data.error) {
						toast.error(err.response.data.error);
						if (err.response.status === 404) {
							history.push("/tickets");
						}
					}
				}
			};
			fetchMessages();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [pageNumber, ticketId, history]);

	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);
		socket.emit("joinChatBox", ticketId);

		socket.on("appMessage", data => {
			if (data.action === "create") {
				dispatch({ type: "ADD_MESSAGE", payload: data.message });
				scrollToBottom();
			}
			if (data.action === "update") {
				dispatch({ type: "UPDATE_MESSAGE", payload: data.message });
			}
		});

		socket.on("ticket", data => {
			if (data.action === "updateStatus") {
				setTicket({ ...data.ticket, user: data.user });
			}

			if (data.action === "delete") {
				toast.success("Ticket deleted sucessfully.");
				history.push("/tickets");
			}
		});

		socket.on("contact", data => {
			if (data.action === "update") {
				setContact(data.contact);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [ticketId, history]);

	const handleOpenMessageOptionsMenu = (e, messageId) => {
		setAnchorEl(e.currentTarget);
		setSelectedMessageId(messageId);
	};

	const handleCloseMessageOptionsMenu = e => {
		setAnchorEl(null);
	};

	const loadMore = () => {
		setPageNumber(prevPageNumber => prevPageNumber + 1);
	};

	const scrollToBottom = () => {
		if (lastMessageRef.current) {
			lastMessageRef.current.scrollIntoView({});
		}
	};

	const handleScroll = e => {
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

	const checkMessaageMedia = message => {
		if (message.mediaType === "image") {
			return (
				<ModalImage
					className={classes.messageMedia}
					smallSrcSet={message.mediaUrl}
					medium={message.mediaUrl}
					large={message.mediaUrl}
					alt="image"
				/>
			);
		}
		if (message.mediaType === "audio") {
			return (
				<audio controls>
					<source src={message.mediaUrl} type="audio/ogg"></source>
				</audio>
			);
		}

		if (message.mediaType === "video") {
			return (
				<video
					className={classes.messageMedia}
					src={message.mediaUrl}
					controls
				/>
			);
		} else {
			return (
				<a href={message.mediaUrl} target="_blank" rel="noopener noreferrer">
					Download
				</a>
			);
		}
	};

	const handleDrawerOpen = () => {
		setDrawerOpen(true);
	};

	const handleDrawerClose = () => {
		setDrawerOpen(false);
	};

	const renderMessageAck = message => {
		if (message.ack === 0) {
			return <AccessTimeIcon fontSize="small" className={classes.ackIcons} />;
		}
		if (message.ack === 1) {
			return <DoneIcon fontSize="small" className={classes.ackIcons} />;
		}
		if (message.ack === 2) {
			return <DoneAllIcon fontSize="small" className={classes.ackIcons} />;
		}
		if (message.ack === 3) {
			return (
				<DoneAllIcon fontSize="small" className={classes.ackDoneAllIcon} />
			);
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
						{format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
					</div>
				</span>
			);
		}
		if (index < messagesList.length - 1) {
			let messageDay = parseISO(messagesList[index].createdAt);
			let previousMessageDay = parseISO(messagesList[index - 1].createdAt);

			if (!isSameDay(messageDay, previousMessageDay)) {
				return (
					<span
						className={classes.dailyTimestamp}
						key={`timestamp-${message.id}`}
					>
						<div className={classes.dailyTimestampText}>
							{format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
						</div>
					</span>
				);
			}
		}
		if (index === messagesList.length - 1) {
			return (
				<div
					key={`ref-${message.createdAt}`}
					ref={lastMessageRef}
					style={{ float: "left", clear: "both" }}
				/>
			);
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

	const renderMessages = () => {
		if (messagesList.length > 0) {
			const viewMessagesList = messagesList.map((message, index) => {
				if (!message.fromMe) {
					return (
						<LinkifyWithTargetBlank key={message.id}>
							{renderDailyTimestamps(message, index)}
							{renderMessageDivider(message, index)}
							<div className={classes.messageLeft}>
								{message.mediaUrl && checkMessaageMedia(message)}
								<div className={classes.textContentItem}>
									{message.body}
									<span className={classes.timestamp}>
										{format(parseISO(message.createdAt), "HH:mm")}
									</span>
								</div>
							</div>
						</LinkifyWithTargetBlank>
					);
				} else {
					return (
						<LinkifyWithTargetBlank key={message.id}>
							{renderDailyTimestamps(message, index)}
							{renderMessageDivider(message, index)}
							<div className={classes.messageRight}>
								<IconButton
									variant="contained"
									size="small"
									id="messageActionsButton"
									className={classes.messageActionsButton}
									onClick={e => handleOpenMessageOptionsMenu(e, message.id)}
								>
									<ExpandMore />
								</IconButton>
								{message.mediaUrl && checkMessaageMedia(message)}
								<div className={classes.textContentItem}>
									{message.body}
									<span className={classes.timestamp}>
										{format(parseISO(message.createdAt), "HH:mm")}
										{renderMessageAck(message)}
									</span>
								</div>
							</div>
						</LinkifyWithTargetBlank>
					);
				}
			});
			return viewMessagesList;
		} else {
			return <div>Say hello to your new contact!</div>;
		}
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
				<TicketHeader loading={ticketLoading}>
					<TicketInfo
						contact={contact}
						ticket={ticket}
						onClick={handleDrawerOpen}
					/>
					<TicketActionButtons ticket={ticket} />
				</TicketHeader>
				<div className={classes.messagesListWrapper}>
					<div
						id="messagesList"
						className={classes.messagesList}
						onScroll={handleScroll}
					>
						{messagesList.length > 0 ? renderMessages() : []}
					</div>
					<MessageInput ticketStatus={ticket.status} />
					{loading ? (
						<div>
							<CircularProgress className={classes.circleLoading} />
						</div>
					) : null}
				</div>
			</Paper>
			<MessageOptionsMenu
				messageId={selectedMessageId}
				anchorEl={anchorEl}
				menuOpen={messageOptionsMenuOpen}
				handleClose={handleCloseMessageOptionsMenu}
			/>
			<ContactDrawer
				open={drawerOpen}
				handleDrawerClose={handleDrawerClose}
				contact={contact}
				loading={ticketLoading}
			/>
		</div>
	);
};

export default Ticket;
