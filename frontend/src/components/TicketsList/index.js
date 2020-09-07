import React, { useState, useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";

import TicketListItem from "../TicketListItem";
import TicketsSkeleton from "../TicketsSkeleton";
import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	ticketsListWrapper: {
		position: "relative",
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflow: "hidden",
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
	},

	ticketsList: {
		flex: 1,
		overflowY: "scroll",
		...theme.scrollbarStyles,
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

	noTicketsDiv: {
		display: "flex",
		height: "100px",
		margin: 40,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	},
}));

const TicketsList = ({ status, searchParam, showAll }) => {
	const classes = useStyles();
	const [pageNumber, setPageNumber] = useState(1);

	const { tickets, hasMore, loading, dispatch } = useTickets({
		pageNumber,
		searchParam,
		status,
		showAll,
	});

	useEffect(() => {
		dispatch({ type: "RESET" });
		setPageNumber(1);
	}, [status, searchParam, dispatch, showAll]);

	const loadMore = () => {
		setPageNumber(prevState => prevState + 1);
	};

	const handleScroll = e => {
		if (!hasMore || loading) return;
		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
		if (scrollHeight - (scrollTop + 100) < clientHeight) {
			loadMore();
		}
	};

	return (
		<div className={classes.ticketsListWrapper}>
			<Paper
				square
				name="closed"
				elevation={0}
				className={classes.ticketsList}
				onScroll={handleScroll}
			>
				<List style={{ paddingTop: 0 }}>
					{status === "open" && (
						<div className={classes.ticketsListHeader}>
							{i18n.t("ticketsList.assignedHeader")}
							<span className={classes.ticketsCount}>{tickets.length}</span>
						</div>
					)}
					{status === "pending" && (
						<div className={classes.ticketsListHeader}>
							{i18n.t("ticketsList.pendingHeader")}
							<span className={classes.ticketsCount}>{tickets.length}</span>
						</div>
					)}
					{tickets.length === 0 && !loading ? (
						<div className={classes.noTicketsDiv}>
							<span className={classes.noTicketsTitle}>
								{i18n.t("ticketsList.noTicketsTitle")}
							</span>
							<p className={classes.noTicketsText}>
								{i18n.t("ticketsList.noTicketsMessage")}
							</p>
						</div>
					) : (
						<>
							{tickets.map(ticket => (
								<TicketListItem ticket={ticket} key={ticket.id} />
							))}
						</>
					)}
					{loading && <TicketsSkeleton />}
				</List>
			</Paper>
		</div>
	);
};

export default TicketsList;
