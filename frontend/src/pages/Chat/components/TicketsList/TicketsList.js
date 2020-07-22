import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../../../util/api";
import openSocket from "socket.io-client";

import { parseISO, format } from "date-fns";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
// import AddIcon from "@material-ui/icons/Add";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Button from "@material-ui/core/Button";
// import Fab from "@material-ui/core/Fab";
// import AddContactModal from "../AddContact/AddContactModal";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";

import TicketSkeleton from "./TicketSkeleton";

const useStyles = makeStyles(theme => ({
	contactsWrapper: {
		position: "relative",
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflow: "hidden",
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
	},

	tabsHeader: {
		// display: "flex",
		flex: "none",
		backgroundColor: "#eee",
	},

	settingsIcon: {
		alignSelf: "center",
		marginLeft: "auto",
		padding: 8,
	},

	openTicketsList: {
		height: "50%",
		overflowY: "scroll",
		"&::-webkit-scrollbar": {
			width: "8px",
		},
		"&::-webkit-scrollbar-thumb": {
			boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
			backgroundColor: "#e8e8e8",
		},
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
	},

	closedTicketsList: {
		flex: 1,
		overflowY: "scroll",
		"&::-webkit-scrollbar": {
			width: "8px",
		},
		"&::-webkit-scrollbar-thumb": {
			boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
			backgroundColor: "#e8e8e8",
		},
		borderTop: "2px solid rgba(0, 0, 0, 0.12)",
	},

	ticketsListHeader: {
		display: "flex",
		// flexShrink: 0,
		// -webkitBoxAlign: "center",
		alignItems: "center",
		fontWeight: 600,
		fontSize: "16px",
		height: "56px",
		// backgroundColor: "#eee",
		color: "rgb(67, 83, 105)",
		padding: "0px 12px",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
	},

	ticketsCount: {
		fontWeight: "normal",
		color: "rgb(104, 121, 146)",
		marginLeft: "8px",
		fontSize: "14px",
	},

	ticket: {
		position: "relative",
		"& .hidden-button": {
			display: "none",
		},
		"&:hover .hidden-button": {
			display: "flex",
			position: "absolute",
			left: "50%",
		},
	},

	noTicketsDiv: {
		display: "flex",
		height: "100px",
		margin: 40,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	},

	noTicketsText: {
		textAlign: "center",
		color: "rgb(104, 121, 146)",
		fontSize: "14px",
		lineHeight: "1.4",
	},

	noTicketsTitle: {
		textAlign: "center",
		fontSize: "16px",
		fontWeight: "600",
		margin: "0px",
	},

	contactsSearchBox: {
		position: "relative",
		background: "#fafafa",
		padding: "10px 13px",
	},

	serachInputWrapper: {
		background: "#fff",
		display: "flex",
		borderRadius: 40,
		padding: 4,
	},

	searchIcon: {
		color: "grey",
		marginLeft: 6,
		marginRight: 6,
		alignSelf: "center",
	},

	contactsSearchInput: {
		flex: 1,
		border: "none",
		borderRadius: 30,
	},

	contactNameWrapper: {
		display: "flex",
		// display: "inline",
	},

	lastMessageTime: {
		marginLeft: "auto",
	},

	contactLastMessage: {
		paddingRight: 20,
	},

	newMessagesCount: {
		alignSelf: "center",
		marginRight: 8,
		marginLeft: "auto",
	},

	badgeStyle: {
		color: "white",
		backgroundColor: green[500],
	},
	circleLoading: {
		color: green[500],
		opacity: "70%",
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: 12,
		// marginLeft: -12,
	},
}));

const TicketsList = () => {
	const classes = useStyles();
	const token = localStorage.getItem("token");
	const userId = +localStorage.getItem("userId");
	const { ticketId } = useParams();
	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState();
	const [searchParam, setSearchParam] = useState("");
	const [tab, setTab] = useState("open");

	// const [modalOpen, setModalOpen] = useState(false);

	const history = useHistory();

	useEffect(() => {
		if (!("Notification" in window)) {
			console.log("This browser doesn't support notifications");
		} else {
			Notification.requestPermission();
		}
	}, []);

	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				try {
					const res = await api.get("/tickets", {
						params: { searchParam, status: tab },
					});
					setTickets(res.data);
					setLoading(false);
				} catch (err) {
					console.log(err);
				}
			};
			fetchContacts();
		}, 1000);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, token, tab]);

	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

		socket.emit("joinNotification");

		socket.on("ticket", data => {
			if (data.action === "updateUnread") {
				resetUnreadMessages(data.ticketId);
			}
			if (data.action === "updateStatus") {
				updateTicketStatus(data);
			}
		});

		socket.on("appMessage", data => {
			console.log(data);
			if (data.action === "create") {
				updateUnreadMessagesCount(data);
				if (
					(ticketId &&
						data.message.ticketId === +ticketId &&
						document.visibilityState === "visible") ||
					(data.ticket.userId !== userId && data.ticket.userId)
				)
					return;
				showDesktopNotification(data);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [ticketId, userId]);

	const updateUnreadMessagesCount = data => {
		setTickets(prevState => {
			const ticketIndex = prevState.findIndex(
				ticket => ticket.id === data.message.ticketId
			);

			if (ticketIndex !== -1) {
				let aux = [...prevState];
				aux[ticketIndex].unreadMessages++;
				aux[ticketIndex].lastMessage = data.message.body;
				aux.unshift(aux.splice(ticketIndex, 1)[0]);
				return aux;
			} else {
				return [data.ticket, ...prevState];
			}
		});
	};

	const updateTicketStatus = data => {
		setTickets(prevState => {
			const ticketIndex = prevState.findIndex(
				ticket => ticket.id === data.ticket.id
			);

			if (ticketIndex !== -1) {
				let aux = [...prevState];
				aux[ticketIndex] = data.ticket;
				return aux;
			} else {
				return [data.ticket, ...prevState];
			}
		});
	};

	const showDesktopNotification = data => {
		const options = {
			body: `${data.message.body} - ${format(new Date(), "HH:mm")}`,
			icon: data.contact.profilePicUrl,
		};
		new Notification(`Mensagem de ${data.contact.name}`, options);
		document.getElementById("sound").play();
	};

	const resetUnreadMessages = ticketId => {
		setTickets(prevState => {
			const ticketIndex = prevState.findIndex(
				ticket => ticket.id === +ticketId
			);
			if (ticketIndex !== -1) {
				let aux = [...prevState];
				aux[ticketIndex].unreadMessages = 0;
				return aux;
			} else {
				return prevState;
			}
		});
	};

	const handleSelectTicket = (e, ticket) => {
		history.push(`/chat/${ticket.id}`);
	};

	const handleSearchContact = e => {
		// let searchTerm = e.target.value.toLowerCase();
		setSearchParam(e.target.value.toLowerCase());
	};

	const handleChangeTab = (event, newValue) => {
		setTab(newValue);
	};

	const handleAcepptTicket = async ticketId => {
		try {
			await api.put(`/tickets/${ticketId}`, {
				status: "open",
				userId: userId,
			});
		} catch (err) {
			alert(err);
		}
	};

	const countTickets = (status, userId) => {
		const ticketsFound = tickets.filter(
			t => t.status === status && t.userId === userId
		).length;

		if (ticketsFound === 0) return "";
		return ticketsFound;
	};

	const renderTickets = (status, userId) => {
		const viewTickets = tickets.map(ticket => {
			if (
				(ticket.status === status && ticket.userId === userId) ||
				ticket.status === "closed"
			)
				return (
					<React.Fragment key={ticket.id}>
						<ListItem
							dense
							button
							onClick={e => {
								if (ticket.status === "pending") return;
								handleSelectTicket(e, ticket);
							}}
							selected={ticketId && +ticketId === ticket.id}
							className={classes.ticket}
						>
							<ListItemAvatar>
								<Avatar
									src={
										ticket.Contact.profilePicUrl && ticket.Contact.profilePicUrl
									}
								></Avatar>
							</ListItemAvatar>
							<ListItemText
								primary={
									<span className={classes.contactNameWrapper}>
										<Typography
											noWrap
											component="span"
											variant="body2"
											color="textPrimary"
										>
											{ticket.Contact.name}
										</Typography>
										{ticket.lastMessage && (
											<Typography
												className={classes.lastMessageTime}
												component="span"
												variant="body2"
												color="textSecondary"
											>
												{format(parseISO(ticket.updatedAt), "HH:mm")}
											</Typography>
										)}
									</span>
								}
								secondary={
									<span className={classes.contactNameWrapper}>
										<Typography
											className={classes.contactLastMessage}
											noWrap
											component="span"
											variant="body2"
											color="textSecondary"
										>
											{ticket.lastMessage || <br />}
										</Typography>
										<Badge
											className={classes.newMessagesCount}
											badgeContent={ticket.unreadMessages}
											classes={{
												badge: classes.badgeStyle,
											}}
										/>
									</span>
								}
							/>
							{ticket.status === "pending" ? (
								<Button
									variant="contained"
									size="small"
									color="primary"
									className="hidden-button"
									onClick={e => handleAcepptTicket(ticket.id)}
								>
									Aceitar
								</Button>
							) : null}
						</ListItem>
						<Divider variant="inset" component="li" />
					</React.Fragment>
				);
			else return null;
		});

		if (loading) {
			return <TicketSkeleton />;
		} else if (countTickets(status, userId) === "" && status !== "closed") {
			return (
				<div className={classes.noTicketsDiv}>
					<span className={classes.noTicketsTitle}>
						{status === "pending" ? "Tudo resolvido" : "Pronto pra mais?"}
					</span>
					<p className={classes.noTicketsText}>
						{status === "pending"
							? "Nenhum ticket pendente por enquanto. Hora do café!"
							: "Aceite um ticket da fila para começar."}
					</p>
				</div>
			);
		} else {
			return viewTickets;
		}
	};

	return (
		<Paper elevation={0} variant="outlined" className={classes.contactsWrapper}>
			<Paper elevation={0} square className={classes.tabsHeader}>
				<Tabs
					value={tab}
					onChange={handleChangeTab}
					variant="fullWidth"
					indicatorColor="primary"
					textColor="primary"
					aria-label="icon label tabs example"
				>
					<Tab
						value="open"
						icon={<MoveToInboxIcon />}
						label="Caixa de Entrada"
					/>
					<Tab
						value="closed"
						icon={<CheckCircleOutlineIcon />}
						label="Resolvidos"
					/>
				</Tabs>
			</Paper>
			<Paper square elevation={0} className={classes.contactsSearchBox}>
				<div className={classes.serachInputWrapper}>
					<SearchIcon className={classes.searchIcon} />
					<InputBase
						className={classes.contactsSearchInput}
						placeholder="Buscar contatos"
						type="search"
						onChange={handleSearchContact}
					/>
				</div>
			</Paper>
			{tab === "open" ? (
				<>
					<Paper square elevation={0} className={classes.openTicketsList}>
						<List style={{ paddingTop: 0 }}>
							<div className={classes.ticketsListHeader}>
								Meus tickets
								<span className={classes.ticketsCount}>
									{countTickets("open", userId)}
								</span>
							</div>
							{renderTickets("open", userId)}
						</List>
					</Paper>
					<Paper square elevation={0} className={classes.openTicketsList}>
						<List style={{ paddingTop: 0 }}>
							<div className={classes.ticketsListHeader}>
								Aguardando
								<span className={classes.ticketsCount}>
									{countTickets("pending", null)}
								</span>
							</div>
							{renderTickets("pending", null)}
						</List>
					</Paper>
				</>
			) : (
				<Paper square elevation={0} className={classes.closedTicketsList}>
					<List>{renderTickets("closed", userId)}</List>
				</Paper>
			)}
			<audio id="sound" preload="auto">
				<source src={require("../../../../util/sound.mp3")} type="audio/mpeg" />
				<source src={require("../../../../util/sound.ogg")} type="audio/ogg" />
				<embed hidden={true} autostart="false" loop={false} src="./sound.mp3" />
			</audio>
		</Paper>
	);
};

export default TicketsList;
