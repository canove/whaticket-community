import React, { useState, useEffect, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";

import { isSameDay, parseISO, format } from "date-fns";
import openSocket from "socket.io-client";
import InfiniteScrollReverse from "react-infinite-scroll-reverse";
import ModalImage from "react-modal-image";

import { makeStyles } from "@material-ui/core/styles";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import CircularProgress from "@material-ui/core/CircularProgress";
import DoneIcon from "@material-ui/icons/Done";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import ReplayIcon from "@material-ui/icons/Replay";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import { green } from "@material-ui/core/colors";

import whatsBackground from "../../../../Images/wa-background.png";

import api from "../../../../util/api";

import MessagesInput from "../MessagesInput/MessagesInput";

const useStyles = makeStyles(theme => ({
	mainWrapper: {
		height: "100%",
		display: "flex",
		flexDirection: "column",
		overflow: "hidden",
	},

	messagesHeader: {
		display: "flex",
		backgroundColor: "#eee",
		flex: "none",
	},

	actionButtons: {
		marginRight: 6,
		alignSelf: "center",
		marginLeft: "auto",
		"& > *": {
			margin: theme.spacing(1),
		},
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
		"&::-webkit-scrollbar": {
			width: "8px",
		},
		"&::-webkit-scrollbar-thumb": {
			// borderRadius: "2px",
			boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
			backgroundColor: "#e8e8e8",
		},
	},

	circleLoading: {
		color: green[500],
		position: "absolute",
		opacity: "70%",
		top: 0,
		left: "50%",
		marginTop: 12,
		// marginLeft: -12,
	},

	messageLeft: {
		marginTop: 5,
		minWidth: 100,
		maxWidth: 600,
		height: "auto",
		display: "block",
		position: "relative",

		backgroundColor: "#ffffff",
		alignSelf: "flex-start",
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 8,
		paddingLeft: 5,
		paddingRight: 5,
		paddingTop: 5,
		paddingBottom: 0,
		boxShadow: "0 2px 2px #808888",
	},

	messageRight: {
		marginLeft: 20,
		marginTop: 5,
		minWidth: 100,
		maxWidth: 600,
		height: "auto",
		display: "block",
		position: "relative",

		backgroundColor: "#dcf8c6",
		alignSelf: "flex-end",
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 0,
		paddingLeft: 5,
		paddingRight: 5,
		paddingTop: 5,
		paddingBottom: 0,
		boxShadow: "0 2px 2px #808888",
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

const MessagesList = () => {
	const { ticketId } = useParams();
	const history = useHistory();
	const classes = useStyles();

	const token = localStorage.getItem("token");
	const userId = localStorage.getItem("userId");

	const [loading, setLoading] = useState(true);
	const [contact, setContact] = useState({});
	const [ticket, setTicket] = useState({});
	const [messagesList, setMessagesList] = useState([]);
	const [hasMore, setHasMore] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [pageNumber, setPageNumber] = useState(0);
	const lastMessageRef = useRef();

	useEffect(() => {
		setMessagesList([]);
	}, [searchParam]);

	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchMessages = async () => {
				try {
					const res = await api.get("/messages/" + ticketId, {
						params: { searchParam, pageNumber },
					});
					setContact(res.data.contact);
					setTicket(res.data.ticket);
					setMessagesList(prevMessages => {
						return [...res.data.messages, ...prevMessages];
					});
					setHasMore(res.data.messages.length > 0);
					setLoading(false);
					if (pageNumber === 1 && res.data.messages.length > 1) {
						scrollToBottom();
					}
				} catch (err) {
					console.log(err);
					alert(err);
				}
			};
			fetchMessages();
		}, 1000);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, pageNumber, ticketId, token]);

	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

		socket.emit("joinChatBox", ticketId, () => {});

		socket.on("appMessage", data => {
			if (data.action === "create") {
				addMessage(data.message);
				scrollToBottom();
			} else if (data.action === "update") {
				updateMessageAck(data.message);
			}
		});

		return () => {
			socket.disconnect();
			setSearchParam("");
			setPageNumber(1);
			setMessagesList([]);
		};
	}, [ticketId]);

	const handleSearch = e => {
		setSearchParam(e.target.value);
		setPageNumber(1);
	};

	const loadMore = () => {
		setPageNumber(prevPageNumber => prevPageNumber + 1);
	};

	const addMessage = message => {
		setMessagesList(prevState => {
			if (prevState.length >= 20) {
				let aux = [...prevState];
				aux.shift();
				aux.push(message);
				return aux;
			} else {
				return [...prevState, message];
			}
		});
	};

	const updateMessageAck = message => {
		let id = message.id;
		setMessagesList(prevState => {
			let aux = [...prevState];
			let messageIndex = aux.findIndex(message => message.id === id);
			if (messageIndex !== -1) {
				aux[messageIndex].ack = message.ack;
			}
			return aux;
		});
	};

	const scrollToBottom = () => {
		if (lastMessageRef.current) {
			lastMessageRef.current.scrollIntoView({});
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
			return <a href={message.mediaUrl}>Download</a>;
		}
	};

	const handleUpdateTicketStatus = async (status, userId) => {
		try {
			await api.put(`/tickets/${ticketId}`, {
				status: status,
				userId: userId || null,
			});
		} catch (err) {
			console.log(err);
		}
		history.push("/chat");
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
		if (index + 1 === messagesList.length) {
			return (
				<div
					key={`ref-${message.createdAt}`}
					ref={lastMessageRef}
					style={{ float: "left", clear: "both" }}
				/>
			);
		}
	};

	const renderMessages = () => {
		if (messagesList.length > 0) {
			const viewMessagesList = messagesList.map((message, index) => {
				if (!message.userId) {
					return [
						renderDailyTimestamps(message, index),
						<div className={classes.messageLeft} key={message.id}>
							{message.mediaUrl && checkMessaageMedia(message)}
							<div className={classes.textContentItem}>
								{message.body}
								<span className={classes.timestamp}>
									{format(parseISO(message.createdAt), "HH:mm")}
								</span>
							</div>
						</div>,
					];
				} else {
					return [
						renderDailyTimestamps(message, index),
						<div className={classes.messageRight} key={message.id}>
							{message.mediaUrl && checkMessaageMedia(message)}
							<div className={classes.textContentItem}>
								{message.body}
								<span className={classes.timestamp}>
									{format(parseISO(message.createdAt), "HH:mm")}
									{renderMessageAck(message)}
								</span>
							</div>
						</div>,
					];
				}
			});
			return viewMessagesList;
		} else {
			return <div>Diga olá ao seu novo contato</div>;
		}
	};

	return (
		<div className={classes.mainWrapper}>
			<Card variant="outlined" square className={classes.messagesHeader}>
				{contact.name ? (
					<CardHeader
						titleTypographyProps={{ noWrap: true }}
						subheaderTypographyProps={{ noWrap: true }}
						avatar={<Avatar alt="contact_image" src={contact.profilePicUrl} />}
						title={`${contact.name} #${ticket.id}`}
						subheader={`Atribuído á ${ticket.userId}`}
					/>
				) : (
					<CardHeader
						titleTypographyProps={{ noWrap: true }}
						subheaderTypographyProps={{ noWrap: true }}
						avatar={<Avatar alt="contact_image" />}
						title=""
						subheader=""
					/>
				)}

				<div className={classes.actionButtons}>
					<Button
						startIcon={<ReplayIcon />}
						size="small"
						onClick={e => handleUpdateTicketStatus("pending")}
					>
						Retornar
					</Button>
					<Button
						size="small"
						variant="contained"
						color="primary"
						onClick={e => handleUpdateTicketStatus("closed", userId)}
					>
						Resolver
					</Button>
				</div>
			</Card>
			<div className={classes.messagesListWrapper}>
				<InfiniteScrollReverse
					className={classes.messagesList}
					hasMore={hasMore}
					isLoading={loading}
					loadMore={loadMore}
					loadArea={10}
				>
					{messagesList.length > 0 ? renderMessages() : []}
				</InfiniteScrollReverse>
				<MessagesInput searchParam={searchParam} />
				{loading ? (
					<div>
						<CircularProgress className={classes.circleLoading} />
					</div>
				) : null}
			</div>
		</div>
	);
};

export default MessagesList;
