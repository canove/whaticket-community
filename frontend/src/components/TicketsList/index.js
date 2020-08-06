import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import openSocket from "socket.io-client";
import { parseISO, format } from "date-fns";
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroller";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Button from "@material-ui/core/Button";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

import TicketsSkeleton from "../TicketsSkeleton";
import NewTicketModal from "../NewTicketModal";

import api from "../../services/api";

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

	tab: {
		minWidth: 120, // a number of your choice
		width: 120, // a number of your choice
	},

	halfTicketsList: {
		height: "50%",
		overflowY: "scroll",
		"&::-webkit-scrollbar": {
			width: "8px",
			height: "8px",
		},
		"&::-webkit-scrollbar-thumb": {
			boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
			backgroundColor: "#e8e8e8",
		},
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
	},

	fullHeightTicketsList: {
		flex: 1,
		overflowY: "scroll",
		"&::-webkit-scrollbar": {
			width: "8px",
			height: "8px",
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
		fontWeight: 500,
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

	ticketsListActions: {
		flex: "none",
		marginLeft: "auto",
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
		justifyContent: "space-between",
	},

	lastMessageTime: {
		justifySelf: "flex-end",
	},

	closedBadge: {
		alignSelf: "center",
		justifySelf: "flex-end",
		marginRight: 32,
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

const TabPanel = ({ children, value, index, ...rest }) => {
	if (value === index) {
		return (
			<div
				role="tabpanel"
				id={`simple-tabpanel-${index}`}
				aria-labelledby={`simple-tab-${index}`}
				{...rest}
			>
				<>{children}</>
			</div>
		);
	} else return null;
};

const TicketsList = () => {
	const classes = useStyles();
	const history = useHistory();

	const token = localStorage.getItem("token");
	const userId = +localStorage.getItem("userId");
	const { ticketId } = useParams();
	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState();
	const [searchParam, setSearchParam] = useState("");
	const [tab, setTab] = useState("open");
	const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
	const [showAllTickets, setShowAllTickets] = useState(false);

	const [pageNumber, setPageNumber] = useState(1);
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!("Notification" in window)) {
			console.log("This browser doesn't support notifications");
		} else {
			Notification.requestPermission();
		}
	}, []);

	useEffect(() => {
		setTickets([]);
		setPageNumber(1);
	}, [searchParam, tab]);

	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				try {
					const { data } = await api.get("/tickets", {
						params: { searchParam, pageNumber, status: tab },
					});
					setTickets(prevState => {
						return [...prevState, ...data.tickets];
					});
					setCount(data.count);
					setLoading(false);
				} catch (err) {
					console.log(err);
				}
			};
			fetchContacts();
		}, 1000);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, pageNumber, token, tab]);

	console.log(pageNumber);

	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

		socket.emit("joinNotification");

		socket.on("ticket", data => {
			if (data.action === "updateUnread") {
				resetUnreadMessages(data);
			}
			if (data.action === "updateStatus" || data.action === "create") {
				updateTickets(data);
			}
			if (data.action === "delete") {
				deleteTicket(data);
				if (ticketId && data.ticketId === +ticketId) {
					toast.warn("O ticket que você estava foi deletado.");
					history.push("/chat");
				}
			}
		});

		socket.on("appMessage", data => {
			if (data.action === "create") {
				updateTickets(data);
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
	}, [ticketId, userId, history]);

	const loadMore = () => {
		if (loading) return;
		setPageNumber(prevPageNumber => prevPageNumber + 1);
	};

	const updateTickets = ({ ticket }) => {
		setTickets(prevState => {
			const ticketIndex = prevState.findIndex(t => t.id === ticket.id);

			if (ticketIndex === -1) {
				return [ticket, ...prevState];
			} else {
				let aux = [...prevState];
				aux[ticketIndex] = ticket;
				aux.unshift(aux.splice(ticketIndex, 1)[0]);
				return aux;
			}
		});
	};

	const deleteTicket = ({ ticketId }) => {
		setTickets(prevState => {
			const ticketIndex = prevState.findIndex(ticket => ticket.id === ticketId);

			if (ticketIndex === -1) {
				return prevState;
			} else {
				let aux = [...prevState];
				aux.splice(ticketIndex, 1);
				return aux;
			}
		});
	};

	const showDesktopNotification = ({ message, contact, ticket }) => {
		const options = {
			body: `${message.body} - ${format(new Date(), "HH:mm")}`,
			icon: contact.profilePicUrl,
			tag: ticket.id,
		};
		let notification = new Notification(`Mensagem de ${contact.name}`, options);

		notification.onclick = function (event) {
			event.preventDefault(); //
			window.open(`/chat/${ticket.id}`, "_self");
		};

		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				notification.close();
			}
		});

		document.getElementById("sound").play();
	};

	const resetUnreadMessages = ({ ticketId }) => {
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
		if (e.target.value === "") {
			setSearchParam(e.target.value.toLowerCase());
			return;
		}
		setSearchParam(e.target.value.toLowerCase());
		setTab("search");
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
		history.push(`/chat/${ticketId}`);
	};

	const countTickets = (status, userId) => {
		const ticketsFound = tickets.filter(
			t =>
				(t.status === status && t.userId === userId) ||
				(t.status === status && showAllTickets)
		).length;

		if (ticketsFound === 0) return "";
		return ticketsFound;
	};

	const RenderTickets = ({ status, userId }) => {
		const viewTickets = tickets.map(ticket => {
			if (
				(ticket.status === status && ticket.userId === userId) ||
				(ticket.status === status && showAllTickets) ||
				(ticket.status === "closed" && status === "closed") ||
				status === "all"
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
										ticket.contact.profilePicUrl && ticket.contact.profilePicUrl
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
											{ticket.contact.name}
										</Typography>
										{ticket.status === "closed" && (
											<Badge
												className={classes.closedBadge}
												badgeContent={"closed"}
												color="primary"
											/>
										)}
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

		if (loading && status !== "all" && status !== "closed") {
			return <TicketsSkeleton />;
		} else if (
			countTickets(status, userId) === "" &&
			status !== "closed" &&
			status !== "all"
		) {
			return (
				<div className={classes.noTicketsDiv}>
					<span className={classes.noTicketsTitle}>
						{status === "pending" && "Tudo resolvido"}
						{status === "open" && "Pronto pra mais?"}
					</span>
					<p className={classes.noTicketsText}>
						{status === "pending" &&
							"Nenhum ticket pendente por enquanto. Hora do café!"}
						{status === "open" && "Aceite um ticket da fila para começar."}
					</p>
				</div>
			);
		} else {
			return viewTickets;
		}
	};

	const RenderInfiniteScroll = ({ children, loadingKey }) => {
		return (
			<InfiniteScroll
				pageStart={0}
				loadMore={loadMore}
				hasMore={!(tickets.length === count)}
				useWindow={false}
				initialLoad={false}
				threshold={100}
				loader={<TicketsSkeleton key={loadingKey} />}
			>
				<List style={{ paddingTop: 0 }}>{children}</List>
			</InfiniteScroll>
		);
	};

	return (
		<Paper elevation={0} variant="outlined" className={classes.contactsWrapper}>
			<NewTicketModal
				modalOpen={newTicketModalOpen}
				onClose={e => setNewTicketModalOpen(false)}
			/>
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
						value={"open"}
						icon={<MoveToInboxIcon />}
						label="Inbox"
						classes={{ root: classes.tab }}
					/>
					<Tab
						value={"closed"}
						icon={<CheckCircleOutlineIcon />}
						label="Resolvidos"
						classes={{ root: classes.tab }}
					/>
					<Tab
						value={"search"}
						icon={<SearchIcon />}
						label="Busca"
						classes={{ root: classes.tab }}
					/>
				</Tabs>
			</Paper>
			<Paper square elevation={0} className={classes.contactsSearchBox}>
				<div className={classes.serachInputWrapper}>
					<SearchIcon className={classes.searchIcon} />
					<InputBase
						className={classes.contactsSearchInput}
						placeholder="Pesquisar tickets e mensagens"
						type="search"
						onChange={handleSearchContact}
					/>
				</div>
			</Paper>
			<TabPanel value={tab} index={"open"} className={classes.contactsWrapper}>
				<Paper square elevation={0} className={classes.halfTicketsList}>
					<div className={classes.ticketsListHeader}>
						Atendendo
						<span className={classes.ticketsCount}>
							{countTickets("open", userId)}
						</span>
						<div className={classes.ticketsListActions}>
							<FormControlLabel
								label="Todos"
								labelPlacement="start"
								control={
									<Switch
										size="small"
										checked={showAllTickets}
										onChange={e => setShowAllTickets(prevState => !prevState)}
										name="showAllTickets"
										color="primary"
									/>
								}
							/>
							<IconButton
								aria-label="add ticket"
								onClick={e => setNewTicketModalOpen(true)}
								style={{ marginLeft: 20 }}
							>
								<AddIcon />
							</IconButton>
						</div>
					</div>
					<List style={{ paddingTop: 0 }}>
						<RenderTickets status="open" userId={userId} />
					</List>
				</Paper>
				<Paper square elevation={0} className={classes.halfTicketsList}>
					<div className={classes.ticketsListHeader}>
						Aguardando
						<span className={classes.ticketsCount}>
							{countTickets("pending", null)}
						</span>
					</div>
					<List style={{ paddingTop: 0 }}>
						<RenderTickets status="pending" userId={null} />
					</List>
				</Paper>
			</TabPanel>
			<TabPanel
				value={tab}
				index={"closed"}
				className={classes.contactsWrapper}
			>
				<Paper square elevation={0} className={classes.fullHeightTicketsList}>
					<RenderInfiniteScroll loadingKey="loading-closed">
						<RenderTickets status="closed" userId={null} />
					</RenderInfiniteScroll>
				</Paper>
			</TabPanel>
			<TabPanel
				value={tab}
				index={"search"}
				className={classes.contactsWrapper}
			>
				<Paper square elevation={0} className={classes.fullHeightTicketsList}>
					<>
						{tickets.length === 0 && !loading ? (
							<div className={classes.noTicketsDiv}>
								<span className={classes.noTicketsTitle}>Nada encontrado</span>
								<p className={classes.noTicketsText}>
									Tente buscar por outro termo.
								</p>
							</div>
						) : (
							<RenderInfiniteScroll loadingKey="loading-all">
								<RenderTickets status="all" />
							</RenderInfiniteScroll>
						)}
					</>
				</Paper>
			</TabPanel>
			<audio id="sound" preload="auto">
				<source src={require("../../assets/sound.mp3")} type="audio/mpeg" />
				<source src={require("../../assets/sound.ogg")} type="audio/ogg" />
				<embed hidden={true} autostart="false" loop={false} src="./sound.mp3" />
			</audio>
		</Paper>
	);
};

export default TicketsList;
