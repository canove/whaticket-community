import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import TicketsSkeleton from "../TicketsSkeleton";
import NewTicketModal from "../NewTicketModal";
// import TicketsList from "../TicketsList";
import TicketListItem from "../TicketListItem";

import TabPanel from "../TabPanel";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import useTickets from "../../hooks/useTickets";

const useStyles = makeStyles(theme => ({
	ticketsWrapper: {
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
		minWidth: 120,
		width: 120,
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
		alignItems: "center",
		fontWeight: 500,
		fontSize: "16px",
		height: "56px",
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
}));

const Tickets = () => {
	const classes = useStyles();
	const history = useHistory();

	const userId = +localStorage.getItem("userId");
	const { ticketId } = useParams();
	const [searchParam, setSearchParam] = useState("");
	const [tab, setTab] = useState("open");
	const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
	const [showAllTickets, setShowAllTickets] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);

	const {
		tickets: ticketsOpen,
		hasMore: hasMoreOpen,
		loading: loadingOpen,
		dispatch: dispatchOpen,
	} = useTickets({
		pageNumber,
		searchParam,
		status: "open",
	});

	const {
		tickets: ticketsPending,
		hasMore: hasMorePending,
		loading: loadingPending,
		dispatch: dispatchPending,
	} = useTickets({
		pageNumber,
		searchParam,
		status: "pending",
	});

	useEffect(() => {
		dispatchOpen({ type: "RESET" });
		dispatchPending({ type: "RESET" });
		setPageNumber(1);
	}, [searchParam, tab, dispatchOpen, dispatchPending]);

	const loadMore = () => {
		setPageNumber(prevState => prevState + 1);
	};

	const handleSelectTicket = (e, ticket) => {
		history.push(`/chat/${ticket.id}`);
	};

	// console.log(tickets);

	const handleSearchContact = e => {
		if (e.target.value === "") {
			setSearchParam(e.target.value.toLowerCase());
			setTab("open");
			return;
		}
		setSearchParam(e.target.value.toLowerCase());
		setTab("search");
	};

	const handleScroll = e => {
		if (!hasMoreOpen || loadingOpen) return;
		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

		if (scrollHeight - (scrollTop + 100) < clientHeight) {
			loadMore();
		}
	};

	const handleChangeTab = (e, newValue) => {
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

	// const countTickets = (status, userId) => {
	// 	const ticketsFound = tickets.filter(
	// 		t =>
	// 			(t.status === status && t.userId === userId) ||
	// 			(t.status === status && showAllTickets)
	// 	).length;

	// 	if (ticketsFound === 0) return "";
	// 	return ticketsFound;
	// };

	return (
		<Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
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
						label={i18n.t("tickets.tabs.open.title")}
						classes={{ root: classes.tab }}
					/>
					<Tab
						value={"closed"}
						icon={<CheckBoxIcon />}
						label={i18n.t("tickets.tabs.closed.title")}
						classes={{ root: classes.tab }}
					/>
					<Tab
						value={"search"}
						icon={<SearchIcon />}
						label={i18n.t("tickets.tabs.search.title")}
						classes={{ root: classes.tab }}
					/>
				</Tabs>
			</Paper>
			<Paper square elevation={0} className={classes.contactsSearchBox}>
				<div className={classes.serachInputWrapper}>
					<SearchIcon className={classes.searchIcon} />
					<InputBase
						className={classes.contactsSearchInput}
						placeholder={i18n.t("tickets.search.placeholder")}
						type="search"
						onChange={handleSearchContact}
					/>
				</div>
			</Paper>
			<TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
				<Paper
					square
					elevation={0}
					className={classes.halfTicketsList}
					onScroll={handleScroll}
				>
					<div className={classes.ticketsListHeader}>
						{i18n.t("tickets.tabs.open.assignedHeader")}
						<span className={classes.ticketsCount}>{ticketsOpen.length}</span>
						<div className={classes.ticketsListActions}>
							<FormControlLabel
								label={i18n.t("tickets.buttons.showAll")}
								labelPlacement="start"
								control={
									<Switch
										size="small"
										checked={showAllTickets}
										onChange={() => setShowAllTickets(prevState => !prevState)}
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
						{ticketsOpen.length === 0 ? (
							<ListItem>
								<ListItemText>
									You haven&apos;t received any messages yet.
								</ListItemText>
							</ListItem>
						) : (
							ticketsOpen.map(ticket => (
								<TicketListItem
									ticket={ticket}
									key={ticket.id}
									// loading={loading}
									handleSelectTicket={handleSelectTicket}
									handleAcepptTicket={handleAcepptTicket}
									ticketId={ticketId}
								/>
							))
						)}
						{loadingOpen && <TicketsSkeleton />}
					</List>
				</Paper>
				<Paper
					square
					elevation={0}
					className={classes.halfTicketsList}
					onScroll={handleScroll}
				>
					<div className={classes.ticketsListHeader}>
						{i18n.t("tickets.tabs.open.pendingHeader")}
						<span className={classes.ticketsCount}>
							{ticketsPending.length}
						</span>
					</div>
					<List style={{ paddingTop: 0 }}>
						{ticketsPending.length === 0 ? (
							<ListItem>
								<ListItemText>
									You haven&apos;t received any messages yet.
								</ListItemText>
							</ListItem>
						) : (
							ticketsPending.map(ticket => (
								<TicketListItem
									ticket={ticket}
									key={ticket.id}
									// loading={loading}
									handleSelectTicket={handleSelectTicket}
									handleAcepptTicket={handleAcepptTicket}
									ticketId={ticketId}
								/>
							))
						)}
						{loadingPending && <TicketsSkeleton />}
					</List>
				</Paper>
			</TabPanel>
			<TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
				<Paper
					square
					elevation={0}
					className={classes.fullHeightTicketsList}
					onScroll={handleScroll}
				>
					<List style={{ paddingTop: 0 }}>
						{/* <TicketsList
							tickets={tickets}
							loading={loading}
							handleSelectTicket={handleSelectTicket}
							showAllTickets={showAllTickets}
							ticketId={ticketId}
							handleAcepptTicket={handleAcepptTicket}
							status="closed"
							userId={null}
						/>
						{loading && <TicketsSkeleton />} */}
					</List>
				</Paper>
			</TabPanel>
			<TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
				<Paper
					square
					elevation={0}
					className={classes.fullHeightTicketsList}
					onScroll={handleScroll}
				>
					<List style={{ paddingTop: 0 }}>
						{/* <TicketsList
							tickets={tickets}
							loading={loading}
							handleSelectTicket={handleSelectTicket}
							showAllTickets={showAllTickets}
							ticketId={ticketId}
							handleAcepptTicket={handleAcepptTicket}
							noTicketsTitle={i18n.t("tickets.tabs.search.noTicketsTitle")}
							noTicketsMessage={i18n.t("tickets.tabs.search.noTicketsMessage")}
							status="all"
						/>
						{loading && <TicketsSkeleton />} */}
					</List>
				</Paper>
			</TabPanel>
		</Paper>
	);
};

export default Tickets;
